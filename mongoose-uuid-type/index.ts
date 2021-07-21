import { UUID } from './uuid-type.js';

export function MongooseUuid(mongoose: any) {
    mongoose.Schema.Types.UUID = UUID;
    return mongoose;
}