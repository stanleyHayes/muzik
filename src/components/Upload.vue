<script>
import { storage, auth, songsCollection } from '@/includes/firebase'

export default {
    name: 'Upload',
    props: {
        addSong: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            is_drag_over: false,
            uploads: []
        }
    },
    methods: {
        cancelUploads() {
            this.uploads.forEach((upload) => {
                upload.task.cancel()
            })
        },
        upload($event) {
            this.is_drag_over = false

            const files = $event.dataTransfer
                ? [...$event.dataTransfer.files]
                : [...$event.target.files]
            files.forEach((file) => {
                if (file.type !== 'audio/mpeg') {
                    return
                }

                if(!navigator.onLine){
                    this.uploads.push({
                        task: {},
                        current_progress: 100,
                        name: file.name,
                        variant: 'bg-red-400',
                        icon: 'fas fa-times',
                        text_class: 'text-red-400'
                    })
                    return;
                }
                const storageRef = storage.ref()
                const songsRef = storageRef.child(`songs/${file.name}`)
                const task = songsRef.put(file)
                const uploadIndex =
                    this.uploads.push({
                        task,
                        current_progress: 0,
                        name: file.name,
                        variant: 'bg-blue-400',
                        icon: 'fas fa-spinner fa-spin',
                        text_class: ''
                    }) - 1
                task.on(
                    'stage_change',
                    (snapshot) => {
                        this.uploads[uploadIndex].current_progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    },
                    () => {
                        this.uploads[uploadIndex].variant = 'bg-red-400'
                        this.uploads[uploadIndex].icon = 'fas fa-times'
                        this.uploads[uploadIndex].text_class = 'text-red-400'
                    },
                    async () => {
                        const song = {
                            uid: auth.currentUser.uid,
                            display_name: auth.currentUser.displayName,
                            original_name: task.snapshot.ref.name,
                            modified_name: task.snapshot.ref.name,
                            genre: '',
                            comment_count: 0
                        }
                        song.url = await task.snapshot.ref.getDownloadURL()
                        const songRef = await songsCollection.add(song)
                        const songSnapshot = await songRef.get()
                        this.addSong(songSnapshot)

                        this.uploads[uploadIndex].variant = 'bg-green-400'
                        this.uploads[uploadIndex].icon = 'fas fa-check'
                        this.uploads[uploadIndex].text_class = 'text-green-400'
                    }
                )
            })
        }
    },
    beforeUnmount() {
        this.uploads.forEach((upload) => {
            upload.task.cancel()
        })
    }
}
</script>

<template>
    <div class='bg-white rounded border border-gray-200 relative flex flex-col'>
        <div class='px-6 pt-6 pb-5 font-bold border-b border-gray-200'>
            <span class='card-title'>Upload</span>
            <i class='fas fa-upload float-right text-green-400 text-2xl'></i>
        </div>
        <div class='p-6'>
            <!-- Upload Dropbox -->
            <div
                :class="{ 'bg-green-400 border-green-400 border-solid text-white': is_drag_over }"
                @drop.prevent.stop='upload($event)'
                @dragleave.prevent.stop='is_drag_over = false'
                @dragenter.prevent.stop='is_drag_over = true'
                @dragover.prevent.stop='is_drag_over = true'
                @dragend.prevent.stop='is_drag_over = false'
                @dragstart.prevent.stop=''
                @drag.prevent.stop='upload'
                class='w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid'
            >
                <h5>Drop your files here</h5>
                <div>
                    <input type='file' multiple @change='upload($event)' />
                </div>
            </div>
            <hr class='my-6' />
            <!-- Progress Bars -->
            <div v-for='upload in uploads' :key='upload.name' class='mb-4'>
                <!-- File Name -->
                <div class='font-bold text-sm' :class='upload.text_class'>
                    <i :class='upload.icon'></i>
                    {{ upload.name }}
                </div>
                <div class='flex h-4 overflow-hidden bg-gray-200 rounded'>
                    <!-- Inner Progress Bar -->
                    <div
                        class='transition-all progress-bar'
                        :style="{ width: upload.current_progress + '%' }"
                        :class='upload.variant'
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
