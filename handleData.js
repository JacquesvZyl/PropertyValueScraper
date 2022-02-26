const buyData = require("./buy.json");
const rentData = require("./rent.json");
const ObjectsToCsv = require("objects-to-csv");
//const table = document.querySelector("table");

function checkDuplicates(array, cityToCheck, bedrooms, type) {
  for (let i = 0; i < array.length; i++) {
    if (
      array[i][0].includes(cityToCheck) &&
      array[i][1].includes(bedrooms) &&
      array[i][3].includes(type)
    ) {
      return i;
    }
  }

  return false;
}

function sortRentdata() {
  const avgRentArray = [];
  const filteredBuydata = buyData.filter(
    (property) => property.bedrooms && property
  );

  const filteredRentData = rentData
    .map((property) => property.price && property.bedrooms && property)
    .filter((element) => element && element.price < 30000 && element)
    .map((property) => [
      property.city,
      property.bedrooms,
      property.price,
      property.type.toLowerCase().includes("apartment") ? "apartment" : "house",
    ])
    .sort(function (a, b) {
      if (a > b) {
        return -1;
      }
      if (b > a) {
        return 1;
      }
      return 0;
    });

  //console.log(filteredRentData);

  //console.log(filteredRentData);

  function concatRentData(data) {
    for (let i = 0; i < data.length; i++) {
      const [city, bedrooms, price, type] = data[i];

      if (!avgRentArray.length) {
        avgRentArray.push([[city], [bedrooms], [price]]);
      } else if (checkDuplicates(avgRentArray, city, bedrooms, type)) {
        const index = checkDuplicates(avgRentArray, city, bedrooms, type);
        //console.log(`Index: ${index} Price: ${price}`);
        avgRentArray[index][2].splice(1, 0, price);
      } else {
        avgRentArray.push([[city], [bedrooms], [price], [type]]);
      }
    }
    //console.log(avgRentArray);
  }

  function calcAvg(data) {
    for (i = 0; i < data.length; i++) {
      const balance = (
        data[i][2].reduce((counter, current) => counter + current, 0) /
        data[i][2].length
      ).toFixed(2);
      data[i].push(Number(balance));
    }
    //console.log(data);
  }

  function setAvgPriceData(avgRentArray) {
    filteredBuydata.forEach((property) => {
      for (i = 0; i < avgRentArray.length; i++) {
        if (
          avgRentArray[i][0].includes(property.city) &&
          avgRentArray[i][1].includes(property.bedrooms) &&
          property.type.toLowerCase().includes(avgRentArray[i][3])
        ) {
          property.avgRent = avgRentArray[i][4];
        }
      }
    });
  }

  function setRoi() {
    const finalData = filteredBuydata
      .filter((element) => Number.isFinite(element.avgRent) && element)
      .map((element) => {
        element.roiPercentage = Number(
          ((element.avgRent / element.monthlyBond) * 100 - 100).toFixed(2)
        );
        element.grossYield = Number(
          (((element.avgRent * 12) / element.price) * 100).toFixed(2)
        );
        return element;
      });

    return finalData;
  }

  concatRentData(filteredRentData);
  calcAvg(avgRentArray);
  setAvgPriceData(avgRentArray);
  return setRoi();
}

async function writeToCSV(data) {
  try {
    const csv = new ObjectsToCsv(data);
    await csv.toDisk("./properties.csv", { allColumns: true });
    console.log("..Done!");
  } catch (e) {
    console.log(e);
  }
}

const data = sortRentdata();
writeToCSV(data);
const test = data.filter(
  (el) =>
    el.type.toLowerCase().includes("apartment") &&
    el.price > 300000 &&
    el.price < 700000 &&
    el.grossYield > 18 &&
    el
);

console.log(test);
