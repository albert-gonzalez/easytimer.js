import leftPadding from './leftPadding';

function TimeCounter () {
  this.secondTenths = 0;
  this.seconds = 0;
  this.minutes = 0;
  this.hours = 0;
  this.days = 0;

  /**
   * [toString convert the counted values on a string]
   * @param  {[array]} units           [array with the units to display]
   * @param  {[string]} separator       [separator of the units]
   * @param  {[integer]} leftZeroPadding [number of zero padding]
   * @return {[string]}                 [result string]
   */
  this.toString = function (units, separator, leftZeroPadding) {
    units = units || ['hours', 'minutes', 'seconds'];
    separator = separator || ':';
    leftZeroPadding = leftZeroPadding || 2;

    let stringTime;
    let arrayTime = [];
    let i;

    for (i = 0; i < units.length; i = i + 1) {
      if (this[units[i]] !== undefined) {
        if (units[i] === 'secondTenths') {
          arrayTime.push(this[units[i]]);
        } else {
          arrayTime.push(leftPadding(this[units[i]], leftZeroPadding, '0'));
        }
      }
    }
    stringTime = arrayTime.join(separator);

    return stringTime;
  };
}

export default TimeCounter;
