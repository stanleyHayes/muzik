<script>
import { songsCollection, storage } from '@/includes/firebase'

export default {
    name: 'CompositionItem',
    props: {
        song: {
            type: Object,
            required: true
        },
        updateSong: {
            type: Function,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        removeSong: {
            type: Function,
            required: true
        },
        updateUnsavedFlag: {
            type: Function
        }
    },
    data() {
        return {
            showForm: false,
            schema: {
                modified_name: 'required',
                genre: 'alpha_spaces'
            },
            in_submission: false,
            show_alert: false,
            alert_variant: 'bg-blue-500',
            alert_message: 'Please wait! Updating song info'
        }
    },
    methods: {
        async edit(values) {
            this.in_submission = true
            this.show_alert = true
            this.alert_variant = 'bg-blue-500'
            this.alert_message = 'Please wait! Updating song info'
            try {
                await songsCollection.doc(this.song.docID).update(values)
            } catch (e) {
                this.in_submission = false
                this.alert_variant = 'bg-red-500'
                this.alert_message = 'Something went wrong! Try again later'
                return
            }
            this.in_submission = false
            this.alert_variant = 'bg-green-500'
            this.alert_message = 'Success'

            this.updateSong(this.index, values)
            this.updateUnsavedFlag(false)
        },
        async deleteSong() {
            const storageRef = storage.ref()
            const songRef = storageRef.child(`songs/${this.song.original_name}`)
            await songsCollection.doc(this.song.docID).delete()
            await songRef.delete()
            this.removeSong(this.index)
        }
    }
}
</script>

<template>
    <div class="border border-gray-200 p-3 mb-4 rounded">
        <div>
            <div v-show="!showForm">
                <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
                <button
                    @click.prevent="deleteSong"
                    class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
                >
                    <i class="fa fa-times"></i>
                </button>
                <button
                    @click.prevent="showForm = !showForm"
                    class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
                >
                    <i class="fa fa-pencil-alt"></i>
                </button>
            </div>
        </div>

        <div v-show="showForm">
            <div
                class="text-white text-center font-bold p-4 mb-4"
                v-if="show_alert"
                :class="alert_variant"
            >
                {{ alert_message }}
            </div>
            <vee-form @submit="edit" :initial-values="song" :validation-schema="schema">
                <div class="mb-3">
                    <label class="inline-block mb-2">Song Title</label>
                    <vee-field
                        @input="updateUnsavedFlag(true)"
                        name="modified_name"
                        type="text"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        placeholder="Enter Song Title"
                    />
                    <ErrorMessage name="modified_name" class="text-red-600" />
                </div>
                <div class="mb-3">
                    <label class="inline-block mb-2">Genre</label>
                    <vee-field
                        @input="updateUnsavedFlag(true)"
                        name="genre"
                        type="text"
                        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                        placeholder="Enter Genre"
                    />
                    <ErrorMessage name="genre" class="text-red-600" />
                </div>
                <button
                    :disabled="in_submission"
                    type="submit"
                    class="py-1.5 px-3 rounded text-white bg-green-600"
                >
                    Submit
                </button>
                <button
                    @click.prevent="showForm = false"
                    :disabled="in_submission"
                    type="button"
                    class="py-1.5 px-3 rounded text-white bg-gray-600"
                >
                    Go Back
                </button>
            </vee-form>
        </div>
    </div>
</template>
