import { UUID } from './uuid-type.js';

export function MongooseUuid(mongoose: any) {
    Object.defineProperty(mongoose.SchemaTypes, 'UUID', UUID);
    Object.defineProperty(mongoose.Types, 'UUID', mongoose.SchemaTypes.Buffer);
}
