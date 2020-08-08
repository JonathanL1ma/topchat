import React, { useState, useEffect } from 'react';
import CenterWrapper from '../../global/CenterWrapper/CenterWrapper';
import { useForm } from 'react-hook-form';
import { Chat } from '../../util/model/chat.interface';
import { Message } from '../../util/model/message.interface';
import { useFirestore } from 'reactfire';

import 'firebase/firestore'

interface FormParticipant {
    name: string;
}

interface FormChatStart {
    name: string;
    startMessage: string;
}

export default () => {

    const firestoreApp = useFirestore();
    
    const formParticipant = useForm<FormParticipant>();
    const formChatStart = useForm<FormChatStart>();

    const [participant, setParticipant] = useState<string>('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat>();

    const handleParticipantSubmit = (data: FormParticipant) => {
        setParticipant(data.name);
        formParticipant.setValue('name', '');
    }

    const handleChatStartSubmit = async (data: FormChatStart) => {
        try {

            let chatCreated: Chat;
            let firstMessage: Partial<Message> = {
                content: data.startMessage,
                receiver: data.name,
                sender: participant,
                status: 'WAITING'
            };

            formChatStart.setValue('name', '');
            formChatStart.setValue('startMessage', '');

            const chatAlreadyCreated = await firestoreApp.collection('chats')
                .where('participants', 'array-contains', participant)
                .get();

            // const chatWithReceiver = chatAlreadyCreated.docs.filter(chatReceiver => (chatReceiver.data() as Chat).participants.)

            const chatFinded = chatAlreadyCreated?.docs?.pop()?.data() as Chat;

            if (!chatFinded) {
                const chatToCreate: Chat = {
                    participants: [
                        participant,
                        data.name
                    ]
                }
    
                const chatFirestoreCreated = await (await firestoreApp.collection('chats').add(chatToCreate)).get();
                chatCreated = {
                    ...chatToCreate,
                    id: chatFirestoreCreated.id
                }
    
                firstMessage.chatId = chatFirestoreCreated.id;
                
            } else {
                firstMessage.chatId = chatAlreadyCreated.docs[0].id;
                chatCreated = {
                    id: chatAlreadyCreated.docs[0].id,
                    ...chatFinded
                }
            }
            await firestoreApp.collection('messages').add(firstMessage);
            setSelectedChat(chatCreated);

        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        let cancelChatListener: () => void;

        if (participant) {
            cancelChatListener = firestoreApp.collection('chats')
                .where('participants', 'array-contains', participant)
                .onSnapshot(chatsSnapshot => {
                    if (chatsSnapshot.docs.length !== 0) {
                        const chatsFinded = chatsSnapshot.docs.map(chat => {
                            return {...chat.data(), id: chat.id } as Chat
                        });
                        setChats(_ => chatsFinded)
                    }
                });
        }

        return () => {
            if (cancelChatListener) {
                cancelChatListener();
            }
        }

    }, [participant, firestoreApp]);
        

    if (!participant) {
        return (
            <CenterWrapper>
                <form onSubmit={ formParticipant.handleSubmit(handleParticipantSubmit) }>
                    <input type="text" placeholder="Insert your username... 😀" name="name" ref={ formParticipant.register({ required: true }) } />
                    { formParticipant.errors?.name?.type === 'required' && <p style={{ color: 'red' }}>This field is required</p> }
                    <input type="submit" value="Ingresar" />
                </form>
            </CenterWrapper>
        )
    }

    return (
        <React.Fragment>
            <h2>{participant}</h2>
            <form onSubmit={ formChatStart.handleSubmit(handleChatStartSubmit) }>
                <input type="text" name='name' placeholder='User to start chat...' ref={ formChatStart.register({ required: true }) } />
                { formChatStart.errors?.name?.type === 'required' && <p style={{ color: 'red' }}>This field is required</p> }
                <input type="text" name='startMessage' placeholder='Initial message...' ref={ formChatStart.register({ required: true }) } />
                { formChatStart.errors?.startMessage?.type === 'required' && <p style={{ color: 'red' }}>This field is required</p> }
                <input type="submit" value='Start to chat 😎' />
            </form>
            <div>
                { chats.length === 0 && <p>No hay chats <span role='img' aria-label='emoji'>😣</span></p> }
                { chats.length !== 0 && chats.map(chat => {
                    let owner = chat.participants.filter(participantFinded => participantFinded === participant);
                    let receiver = chat.participants.filter(participantFinded => participantFinded !== participant);
                    return (
                        <div>
                            <p>{owner} enviar a {receiver}</p>
                        </div>
                    )
                }) }
            </div>
        </React.Fragment>
    )

}
