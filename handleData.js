const buyData = require("./buy.json");
const rentData = require("./rent.json");
//const table = document.querySelector("table");

function checkDuplicates(array, cityToCheck, bedrooms) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][0].includes(cityToCheck) && array[i][1].includes(bedrooms)) {
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
    .map((property) => [property.city, property.bedrooms, property.price])
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
      const [city, bedrooms, price] = data[i];

      if (!avgRentArray.length) {
        avgRentArray.push([[city], [bedrooms], [price]]);
      } else if (checkDuplicates(avgRentArray, city, bedrooms)) {
        const index = checkDuplicates(avgRentArray, city, bedrooms);
        //console.log(`Index: ${index} Price: ${price}`);
        avgRentArray[index][2].splice(1, 0, price);
      } else {
        avgRentArray.push([[city], [bedrooms], [price]]);
      }
    }
  }

  function calcAvg(data) {
    for (i = 0; i < data.length; i++) {
      const balance = (
        data[i][2].reduce((counter, current) => counter + current, 0) /
        data[i][2].length
      ).toFixed(2);
      data[i].push(Number(balance));
    }
  }

  function setAvgPriceData(avgRentArray) {
    filteredBuydata.forEach((property) => {
      for (i = 0; i < avgRentArray.length; i++) {
        if (
          avgRentArray[i][0].includes(property.city) &&
          avgRentArray[i][1].includes(property.bedrooms)
        ) {
          property.avgRent = avgRentArray[i][3];
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
        return element;
      });

    return finalData;
  }

  concatRentData(filteredRentData);
  calcAvg(avgRentArray);
  setAvgPriceData(avgRentArray);
  return setRoi();
}

const data = sortRentdata();
const test = data.filter(
  (el) =>
    el.type.toLowerCase().includes("apartment") &&
    el.price > 300000 &&
    el.price < 700000 &&
    el.roiPercentage > 50 &&
    el
);

console.log(test);
/* data.forEach((property) => {
  const html = `
<tr>
  <td>${property.city}</td>
  <td>${property.bedrooms}</td>
  <td>${property.price}</td>
  <td>${property.avgRent}</td>
  <td>${property.monthlyBond}</td>
  <td>${property.roiPercentage}</td>
  <td>${property.link}</td>
</tr>`;

  table.insertAdjacentHTML("beforeend", html);
}); */
