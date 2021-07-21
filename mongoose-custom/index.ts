import { MongooseUrl } from '@thxmike/mongoose-url-type';
import { MongooseUuid } from '@thxmike/mongoose-uuid-type';
import mongoose from 'mongoose';

let new_mongoose = MongooseUuid(mongoose);
let newer_mongoose = MongooseUrl(new_mongoose);

export { newer_mongoose as mongoose };