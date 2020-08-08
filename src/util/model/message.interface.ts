import { MessageStatus } from "../types/chat.types";

export interface Message {
    id?: string;
    content: string;
    sender: string;
    receiver: string;
    status: MessageStatus;
    chatId: string;
}