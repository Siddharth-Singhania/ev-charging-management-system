import mongoose from "mongoose";

const BookingModelSchema = new mongoose.Schema({
    station:{
        type: mongoose.Schema.Types.ObjectId(),
        ref: "ChargingStation",
        required: true
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId(),
        ref: "User",
        required: true
    },
    slot: {
        type: String,
        required: true,
        enum: [
            "09:00-10:00",
            "10:00-11:00",
            "11:00-12:00",
            "12:00-13:00",
            "13:00-14:00",
            "14:00-15:00",
            "15:00-16:00",
            "16:00-17:00"
        ]
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    }
},{timestamps:true})

export const BookingModel = mongoose.model("BookingModel",BookingModelSchema)