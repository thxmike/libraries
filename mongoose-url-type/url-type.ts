import mongoose from 'mongoose';
import normalizeUrl from 'normalize-url';

export class Url extends mongoose.SchemaType {

    private regUrl = /([a-zA-Z]+):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/

    private defaults: any = {"message":""};

    private options: any;

    constructor(path: any, options: any) {
      super(path, options, 'Url');
      this.validate(function (val: any) { return this.validateUrl(val, options) }, options.message || this.defaults.message || 'url is invalid')
    }
  
    // `cast()` takes a parameter that can be anything. You need to
    // validate the provided `val` and throw a `CastError` if you
    // can't convert it.
    cast(val: any) {
        return val !== '' ? normalizeUrl(val) : ''
    }

    validateUrl (val: any, options: any) {
        var required = (typeof options.required === 'function') ? options.required() : options.required
        if ((!val || val === '') && !required) {
            return true
        }
        return this.regUrl.test(val)
    }

    checkRequired(val: any) {
        return typeof val === 'string' && this.validateUrl(val, this.options)
    }
}
  