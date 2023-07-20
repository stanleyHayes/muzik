<script>
import { commentsCollection, songsCollection, auth } from '@/includes/firebase'
import { mapActions, mapState } from 'pinia'
import useUserStore from '@/stores/user'
import usePlayerStore from '@/stores/player'

export default {
    name: 'Song',
    data() {
        return {
            song: {},
            comments: [],
            schema: {
                comment: 'required|min:3'
            },
            is_submitting: false,
            show_alert: false,
            alert_message: 'Please wait! Your comment is being submitted',
            alert_variant: 'bg-blue-500',
            sort: '1'
        }
    },
    async beforeRouteEnter(to, from, next) {
        const documentSnapshot = await songsCollection.doc(to.params.id).get()
        next(async (vm) => {
            if (!documentSnapshot.exists) {
                vm.$router.push({ name: 'home' })
            }

            const { sort } = vm.$route.query

            vm.sort = sort === '1' || sort === '2' ? sort : 1

            vm.song = documentSnapshot.data()
            await vm.getComments()
        })

    },
    computed: {
        ...mapState(useUserStore, ['userLoggedIn']),
        sortedComments() {
            return this.comments.slice().sort((a, b) => {
                if (this.sort === '1') {
                    return new Date(b.datePosted) - new Date(a.datePosted)
                }
                return new Date(a.datePosted) - new Date(b.datePosted)
            })
        }
    },
    methods: {
        async addComment(values, { resetForm }) {
            this.is_submitting = true
            this.show_alert = true
            this.alert_variant = 'bg-blue-500'
            this.alert_message = 'Please wait! Your comment is being submitted'
            await commentsCollection.add({
                content: values.comment,
                datePosted: new Date().toString(),
                sid: this.$route.params.id,
                name: auth.currentUser.displayName,
                uid: auth.currentUser.uid
            })

            this.song.comment_count += 1
            await songsCollection
                .doc(this.$route.params.id)
                .update({ comment_count: this.song.comment_count })

            await this.getComments()
            this.is_submitting = false
            this.alert_variant = 'bg-green-500'
            this.alert_message = 'Comment added'

            resetForm()
        },
        async getComments() {
            const snapshot = await commentsCollection
                .where('sid', '==', this.$route.params.id)
                .get()
            this.comments = []
            snapshot.forEach((document) => {
                this.comments.push({
                    docID: document.id,
                    ...document.data()
                })
            })
        },
        ...mapActions(usePlayerStore, ['newSong'])
    },
    watch: {
        sort(newVal) {
            if (newVal === this.$route.query.sort) {
                return
            }
            this.$router.push({ query: { sort: newVal } })
        }
    }
}
</script>

<template>
    <main>
        <!-- Music Header -->
        <section class="w-full mb-8 py-14 text-center text-white relative">
            <div
                class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
                style="background-image: url(/assets/img/song-header.png)"
            ></div>
            <div class="container mx-auto flex items-center">
                <!-- Play/Pause Button -->
                <button
                    @click.prevent="newSong(song)"
                    type="button"
                    class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
                >
                    <i class="fas fa-play"></i>
                </button>
                <div class="z-50 text-left ml-8">
                    <!-- Song Info -->
                    <div class="text-3xl font-bold">{{ song.modified_name }}</div>
                    <div>{{ song.genre }}</div>
                    <div class="song-price">{{ $n(1, 'currency', 'ja') }}</div>
                </div>
            </div>
        </section>
        <!-- Form -->
        <section id="comments" class="container mx-auto mt-6">
            <div class="bg-white rounded border border-gray-200 relative flex flex-col">
                <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
                    <!-- Comment Count -->
                    <span class="card-title">
                        {{
                            $tc('song.comment_count', song.comment_count, {
                                count: song.comment_count
                            })
                        }}
                    </span>
                    <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
                </div>
                <div class="p-6">
                    <div
                        v-if="show_alert"
                        class="text-white font-bold p-4 mb-6 text-center"
                        :class="alert_variant"
                    >
                        {{ alert_message }}
                    </div>
                    <vee-form v-if="userLoggedIn" @submit="addComment" :validation-schema="schema">
                        <vee-field
                            name="comment"
                            as="textarea"
                            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
                            placeholder="Your comment here..."
                        >
                        </vee-field>
                        <ErrorMessage name="comment" class="text-red-600" />
                        <button
                            :disabled="is_submitting"
                            type="submit"
                            class="py-1.5 px-3 rounded text-white bg-green-600 block"
                        >
                            Submit
                        </button>
                    </vee-form>
                    <!-- Sort Comments -->
                    <select
                        v-model="sort"
                        class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                    >
                        <option value="1">Latest</option>
                        <option value="2">Oldest</option>
                    </select>
                </div>
            </div>
        </section>

        <!-- Comments -->
        <ul class="container mx-auto">
            <li
                v-for="comment in sortedComments"
                :key="comment.docID"
                class="p-6 bg-gray-50 border border-gray-200"
            >
                <!-- Comment Author -->
                <div class="mb-5">
                    <div class="font-bold">{{ comment.name }}</div>
                    <time>{{ comment.datePosted }}</time>
                </div>
                <p>
                    {{ comment.content }}
                </p>
            </li>
        </ul>
    </main>
</template>
