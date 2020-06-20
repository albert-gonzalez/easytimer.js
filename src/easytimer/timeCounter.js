import leftPadding from './leftPadding';

function TimeCounter () {
  this.reset();
}

/**
 * [toString convert the counted values on a string]
 * @param  {array} units           [array with the units to display]
 * @param  {string} separator       [separator of the units]
 * @param  {number} leftZeroPadding [number of zero padding]
 * @return {string}                 [result string]
 */
TimeCounter.prototype.toString = function (units = ['hours', 'minutes', 'seconds'], separator = ':', leftZeroPadding = 2) {
  units = units || ['hours', 'minutes', 'seconds'];
  separator = separator || ':';
  leftZeroPadding = leftZeroPadding || 2;

  const arrayTime = [];
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

  return arrayTime.join(separator);
};

/**
 * [reset reset counter]
 */
TimeCounter.prototype.reset = function () {
  this.secondTenths = 0;
  this.seconds = 0;
  this.minutes = 0;
  this.hours = 0;
  this.days = 0;
};

export default TimeCounter;
