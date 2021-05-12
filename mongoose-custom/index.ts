import { MongooseUrl } from '@thxmike/mongoose-url-type';
import { MongooseUUID } from '@thxmike/mongoose-uuid-type';
import mongoose from 'mongoose';

MongooseUUID(mongoose);
MongooseUrl(mongoose);

export {mongoose};