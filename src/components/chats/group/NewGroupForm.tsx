"use client"

import {api} from "@/lib";
import {useEffect, useState} from "react";
import {User} from "@/models/user";
import {Controller, useForm} from "react-hook-form";
import {ChatRoomType} from "@/models/chat/chatRoom";
import {useRouter} from "next/navigation";

type FormData = {
    title: string,
    participantIds: string[]
}

export function NewGroupForm() {

    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [relatedUsers, setRelatedUsers] = useState<Map<string, User>>(new Map)
    const [usersToAdd, setUsersToAdd] = useState<string[]>([])
    const {register, handleSubmit, control, formState: {errors}} = useForm<FormData>({
        defaultValues: {
            title: 'default title',
            participantIds: []
        }
    })

    useEffect(() => {
        api.chat.fetchRelatedUsers()
            .then(users => new Map(users.map(user => [user.id, user])))
            .then(setRelatedUsers)
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const res = await api.chat.createChatRoom({
                title: data.title,
                participantsIds: usersToAdd,
                chatRoomType: ChatRoomType.GROUP
            })

            // if (res.status !== 200) throw new Error('Failed to create group chat')
            const chatRoom = res.data

            console.log('Group chat created:', chatRoom)
            // handle success (e.g., reset form or show toast)
            router.push(`/chat?chatId=${chatRoom.chatId}`)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 max-w-md">
            <div>
                <label className="block font-semibold mb-1">Group Title</label>
                <input
                    {...register('title', { required: 'Title is required' })}
                    className="w-full border rounded p-2"
                    placeholder="Group name"
                />
                {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
            </div>

            <div>
                <label className="block font-semibold mb-1">Add Participants</label>
                <Controller
                    name="participantIds"
                    control={control}
                    // rules={{ validate: value => value.length > 0 || 'Select at least one person' }}
                    render={({ field }) => (
                        <select
                            multiple
                            className="w-full border rounded p-2 h-32"
                            value={field.value}
                            onChange={(e) => {
                                setUsersToAdd((prev) => {
                                    const newList = [...prev]
                                    const list = Array.from(e.target.selectedOptions, (opt) => opt.value)
                                    newList.push(...list)
                                    console.log('List changed', newList)
                                    return newList
                                })

                                field.onChange(
                                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                                );
                            }
                            }
                        >
                            {[...relatedUsers.values()].map((participant) => (
                                <option key={participant.id} value={participant.id}>
                                    {participant.username}
                                </option>
                            ))}
                        </select>
                    )}
                />
                {errors.participantIds && (
                    <p className="text-red-500 text-sm">{errors.participantIds.message}</p>
                )}
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
            >
                {loading ? 'Creating...' : 'Create Group Chat'}
            </button>
        </form>
    )
}