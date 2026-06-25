
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TicketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        guestName: { type: String, default: null },
        guestEmail: { type: String, default: null },
        guestSessionId: { type: String, default: null, index: true },
        channel: {
            type: String,
            enum: ['help-center', 'live-chat'],
            default: 'help-center'
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null
        },
        subject: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
            default: 'Open'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        messages: [MessageSchema]
    },
    { timestamps: true }
);

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export default Ticket;
