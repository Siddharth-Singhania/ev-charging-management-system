import mongoose from "mongoose";

const chargingStationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    location:{
        type:{
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates:{
            type: [Number],
            required:true,
            validate: {
                validator: function (v){
                    return v.length === 2;
                },
                message: props=>`${props.value} is not a valid GPS coordinates pair`
            }
        }
    },
    status:{
        type:String,
        enum: ['active','inactive'],
        default: 'inactive'
    },
    powerOutput:{
        type: String,
        required: true
    },
    connectorType:{
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps:true})

chargingStationSchema.index({location:'2dsphere'});

export const ChargingStation = mongoose.model("ChargingStation",chargingStationSchema);