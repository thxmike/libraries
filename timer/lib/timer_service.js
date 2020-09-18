class TimerService {

  constructor() {
    this._timer_list = [];
  }

  start_in(func, ms, ...params) {

    let id = setTimeout(func, ms, ...params);

    this._timer_list.push({
      func,
      id
    });
    return id;
  }

  clear_start_in(id) {
    clearTimeout(id);
    this._remove_id_from_timer_list(id);
  }

  static now (unit) {
    const hrTime = process.hrtime();

    switch (unit) {

    case "milli":
      return hrTime[0] * 1000 + hrTime[1] / 1000000;

    case "micro":
      return hrTime[0] * 1000000 + hrTime[1] / 1000;

    case "nano":
      return hrTime[0] * 1000000000 + hrTime[1];

    default:
      return TimerService.now("nano");
    }
  }

  start_interval(func, ms, ...params) {

    let id = setInterval(func, ms, ...params);

    this._timer_list.push({
      func,
      id
    });
    return id;
  }

  clear_interval(id) {
    clearInterval(id);
    this._remove_id_from_timer_list(id);
  }

  _remove_id_from_timer_list(id) {
    let index = this._timer_list.findIndex((timer) => timer.id === id);

    this._timer_list.splice(index, 1);
  }
}

module.exports = TimerService;