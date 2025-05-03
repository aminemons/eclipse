// src/models/Request.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IRequest extends Document {
    name: string;
    position: string;
    qualifications: string;
    status: 'pending' | 'done' | 'refused';
    createdAt: Date;
    updatedAt: Date;
}

const RequestSchema: Schema = new Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    qualifications: { type: String, required: true },
    status: { type: String, enum: ['pending', 'done', 'refused'], default: 'pending' },
}, { timestamps: true });

// Avoid redefining model during hot reloads
const Request = models.Request || model<IRequest>('Request', RequestSchema);

export default Request;