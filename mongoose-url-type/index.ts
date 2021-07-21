import { Url } from './url-type.js';

export function MongooseUrl(mongoose: any) {
    mongoose.Schema.Types.Url = Url;
    return mongoose;
}
