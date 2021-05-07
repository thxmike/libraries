import { Url } from './url-type.js';

export function MongooseUrl(mongoose: any) {
    Object.defineProperty(mongoose.SchemaTypes, 'Url', Url);
    Object.defineProperty(mongoose.Types, 'Url', String);
}
