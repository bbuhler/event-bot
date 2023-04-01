import Calendar from 'telegraf-calendar';
import { Composer } from 'telegraf';

class ExtendedCalendar extends Calendar {
  composer = new Composer();

  setDateListener(onDateSelected) {
    return super.setDateListener.call({
      bot: this.composer,
      helper: this.helper,
    }, onDateSelected);
  }

  getCalendar(date, locale = 'en') {
    if (locale === 'de') {
      this.setStartWeekDay(1);
      this.setWeekDayNames(["S", "M", "D", "M", "D", "F", "S"]);
      this.setMonthNames(["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]);
    } else {
      this.setStartWeekDay(0);
      this.setWeekDayNames(["S", "M", "T", "W", "T", "F", "S"]);
      this.setMonthNames(["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
    }

    return super.getCalendar(date);
  }
}

export default ExtendedCalendar;