class CommonModelManager {
  constructor(mongoose, model) {
    this.mongoose = mongoose;
    this.model = model;
  }

  default_filter(data) {
    return {
      "code": data.code
    };
  }

  get_aggregate_operation(page = 1, per_page = 50, filter = {}) {
    //Mongoose is zero based but pagination is one based
    let mongoose_page = page - 1;

    return this.model
      .find(filter)
      .skip(mongoose_page * per_page)
      .limit(per_page)
      //.lean()
      .select({id: 1, code:1, name: 1})
      .exec()
      .then((docs) => {
        return CommonModelManager.promised_message(200, docs, false);
      })
      .catch((error) => {
        return CommonModelManager.promised_message(400, error.message);
      });
  }

  get_count(filter = {}) {
    return this.model.find(filter).countDocuments();
  }

  get_instance_operation_by_id(id) {
    return this.model
      .findById(id)
      //.lean()
      .exec()
      .then((doc) => {
        if (doc) {
          return CommonModelManager.promised_message(200, doc);
        }
        return CommonModelManager.promised_message(
          401,
          `${id} does not exist`,
          true
        );
      })
      .catch((error) => {
        return CommonModelManager.promised_message(400, error.message);
      });
  }

  get_instance_operation_by_code(code) {
    return this.model
      .find({
        code
      })
      .lean()
      .exec()
      .then((doc) => {
        return CommonModelManager.promised_message(200, doc);
      })
      .catch((error) => {
        return CommonModelManager.promised_message(400, error.message);
      });
  }

  post_operation(data) {
    return this.model
      .findOne(this.default_filter(data))
      .exec()
      .then((instance) => {
        return this.check_if_exists(instance, data);
      })
      .then(() => {
        return this.save_instance(this.model, data);
      })
      .then((instance) => {
        return CommonModelManager.promised_message(
          200,
          instance
        );
      })
      .catch((error) => {
        return CommonModelManager.promised_message(
          !error.status ? 400 : error.status,
          error.message
        );
      });
  }

  patch_operation(id, request_data) {
    return this.model
      .findById(id)
      .exec()
      .then((instance) => {
        return this.check_patch_data(id, request_data, instance);
      })
      .then((instance) => {
        return CommonModelManager.promised_message(
          200,
          instance
        );
      })
      .catch((error) => {
        return CommonModelManager.promised_message(400, error.message);
      });
  }

  delete_operation(id, data, is_soft = true) {
    if (is_soft) {
      return this.soft_delete(id, data);
    }
    return this.hard_delete(id, data);
  }

  soft_delete(id, data) {
    return this.model
      .findById(id)
      .exec()
      .then((instance) => {
        let promise = null;

        if (!instance) {
          promise = CommonModelManager.promised_message(
            410,
            `${CommonModelManager.determine_identifier(instance)} does not exist`,
            true
          );
        }
        promise = this.check_nonce(data.nonce, instance.nonce);
        data.timestamps = {};
        data.timestamps.deleted = Date.now();
        this.set_data(instance, data);
        if (!promise) {
          promise = instance.save();
        }
        return promise;
      })
      .then((instance) => {
        return CommonModelManager.promised_message(
          200,
          instance
        );
      })
      .catch((error) => {
        return CommonModelManager.promised_message(400, error.message);
      });
  }

  hard_delete(id, data) {
    return this.model
      .findById(id)
      .exec()
      .then((instance) => {
        let promise = null;

        if (!instance) {
          promise = CommonModelManager.promised_message(
            410,
            `${CommonModelManager.determine_identifier(instance)} does not exist`,
            true
          );
        }
        promise = this.check_nonce(data.nonce, instance.nonce);
        promise = this.model.deleteOne({ "_id": instance._id }).exec();
        if (!promise) {
          promise = instance.save();
        }
        return promise;
      })
      .then((instance) => {
        return CommonModelManager.promised_message(
          200,
          `${CommonModelManager.determine_identifier(instance)} removed!`
        );
      })
      .catch((error) => {
        return CommonModelManager.promised_message(400, error.message);
      });
  }

  check_patch_data(id, request_data, instance) {
    let promise = null;

    if (instance) {
      promise = this.check_nonce(request_data.nonce, instance.nonce.toString());
      if (!promise) {
        this.set_data(instance, request_data);
        promise = instance.save();
      }
    } else {
      promise = CommonModelManager.promised_message(
        410,
        `${CommonModelManager.determine_identifier(instance)} does not exist`,
        true
      );
    }
    return promise;
  }

  check_nonce(new_nonce, old_nonce) {
    let promise = null;

    if (!CommonModelManager.nonce_exists(new_nonce)) {
      promise = CommonModelManager.promised_message(
        409,
        "nonce is required in the body for incremental updates",
        true
      );
    } else if (
      !CommonModelManager.nonce_matches(old_nonce.toString(), new_nonce)
    ) {
      promise = CommonModelManager.promised_message(
        409,
        "There appears to have been a change before you completed your update. Please retrieve the data and try again.",
        true
      );
    }
    return promise;
  }

  static determine_identifier(instance) {
    let mess = "Item";

    if (instance && instance.code) {
      mess = instance.code;
    } else if (instance && instance.name) {
      mess = instance.name;
    } else if (instance && instance.id) {
      mess = instance.id;
    }
    return mess;
  }

  static nonce_exists(nonce) {
    let exists = false;

    if (nonce) {
      exists = true;
    }
    return exists;
  }

  static nonce_matches(existing_nonce, requested_nonce) {
    let match = false;

    if (existing_nonce === requested_nonce) {
      match = true;
    }
    return match;
  }

  static promised_message(code, message, is_error) {

    let result = {
      "status": code,
      message
    };

    if (is_error) {
      return Promise.reject(result);
    }

    return Promise.resolve(result);
  }

  set_data(ent, data) {
    ent.nonce = this.mongoose.Types.ObjectId();
    ent.timestamps.updated = Date.now();
    if (data.id) {
      ent.id = data.id;
    }
    if (data.code) {
      ent.code = data.code;
    }
    if (data.name) {
      ent.name = data.name;
    }
    if (data.description) {
      ent.description = data.description;
    }
    if (data.timestamps && ent.timestamps.deleted !== data.timestamps.deleted) {
      ent.timestamps.deleted = data.timestamps.deleted;
    }
  }

  check_sub_documents(instance) {
    return Promise.resolve(instance);
  }

  check_if_exists(instance, data) {
    if (instance) {
      let id = CommonModelManager.determine_identifier(instance);
      let test = CommonModelManager.promised_message(
        409,
        `${id} already exists`,
        true
      );

      return test;
    }
    return this.check_sub_documents(data);
  }

  save_instance(Model, data) {
    let prom = {};
    let ent = new Model();

    this.set_data(ent, data);
    prom = ent.save();
    return prom;
  }
}
module.exports = CommonModelManager;