const buyData = require("./buy.json");
const rentData = require("./rent.json");

//console.log(buyData);

function checkDuplicates(array, keyToCheck) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === keyToCheck) return true;
  }
  return false;
}

function sortRentdata() {
  const newArr = [];
  const avgRent = [];
  const filteredBuydata = buyData.filter(
    (property) => property.bedrooms && property
  );

  const filteredData = rentData
    .map((property) => property.price && property)
    .filter((element) => element && element)
    .map((property) => [property.city, property.price])
    .sort(function (a, b) {
      if (a > b) {
        return -1;
      }
      if (b > a) {
        return 1;
      }
      return 0;
    });

  function sort(data) {
    for (let i = 0; i < data.length; i++) {
      counter = i + 1;
      const currentKey = data[i][0];
      let arrayChanged = false;
      while (counter < data.length) {
        const futureKey = data[counter][0];
        const futureValue = data[counter][1];
        if (currentKey === futureKey && !checkDuplicates(newArr, currentKey)) {
          data[i].splice(1, 0, futureValue);
          arrayChanged = true;
        }
        counter++;
      }
      if (
        i < data.length - 1 &&
        (arrayChanged || !checkDuplicates(newArr, currentKey))
      ) {
        newArr.push(data[i]);
      } else if (
        i === data.length - 1 &&
        !checkDuplicates(newArr, currentKey)
      ) {
        newArr.push(data[i]);
      }
    }
    //console.log(newArr)
    return newArr;
  }

  function calcAvg(newArr) {
    //const flattened = newArr.reduce((a, b) => a.concat(b), []);

    for (i = 0; i < newArr.length; i++) {
      let counter = 0;
      const divisible = newArr[i].length - 1;

      for (j = 1; j < newArr[i].length; j++) {
        counter += newArr[i][j];
      }
      const avgPrice = (counter / divisible).toFixed(2);
      avgRent.push([newArr[i][0], avgPrice]);
    }
  }

  function setAvgPriceData(avgRent) {
    filteredBuydata.forEach((property) => {
      for (i = 0; i < avgRent.length; i++) {
        if (avgRent[i][0] === property.city) {
          property.avgRent = Number(avgRent[i][1]);
        }
      }
    });
  }

  function setRoi() {
    const finalData = filteredBuydata
      .filter((element) => Number.isFinite(element.avgRent) && element)
      .map((element) => {
        element.roiPercentage = Number(
          ((element.avgRent / element.monthlyBond) * 100).toFixed(2)
        );
        return element;
      });

    return finalData;
  }

  sort(filteredData);
  calcAvg(newArr);
  setAvgPriceData(avgRent);
  return setRoi();
}

console.log(sortRentdata());
