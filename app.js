const searchbar = document.querySelector(".searchbar");
const iframe = document.getElementById("myntraIframe");

const url = `https://sachinrawat6.github.io/api/`;


let products = [];
let inventoryData = [];

async function fetchProductData() {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();  // Parse response as JSON
      inventoryData.push(...data);
      // console.log(inventoryData)
      console.log('Product data fetched successfully!');
    } else {
      throw new Error('Error fetching data from GitHub');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
fetchProductData();
async function fetchTitle(styleNumber) {
    if (inventoryData.length === 0) {
      await fetchProductData();
    }
    
  
    // Log inventoryData to debug
    console.log(inventoryData);  // Check the structure of the fetched data
  
    // Find the product in inventoryData based on styleNumber and styleColor
    const product = inventoryData.find(item => item.style ==styleNumber);
    
    // If the product is found, return its title and color, otherwise return default values
    if (product) {
      return {
        title: product.name,
        color: product.COLOR || 'Unknown Color',
        id:product.id || "No id found",
        MRP:product.MRP || "",

      };
    } else {
      return { title: 'Unknown Title', color: 'Unknown Color' };
    }
  }
  


// fetch real api from server side 
  

const form = document.getElementById("inventoryForm");
const productTable = document.getElementById("productTable").getElementsByTagName('tbody')[0];
const downloadCSVButton = document.getElementById("downloadCSV");
const inputField = document.getElementById("styleNumber");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  
  const styleNumber = document.getElementById("styleNumber").value;
//   const color = document.getElementById("color").value;
  const size = document.getElementById("size").value;
  const quantity = document.getElementById("quantity").value;

  if (styleNumber  && size && quantity) {
    const product = {
      styleNumber,
      size,
      quantity: parseInt(quantity)
    };
    
    products.push(product);
    addToTable(product);
    form.reset();
    updateDownloadButtonVisibility();
  }
});

function addToTable(product) {
  const row = productTable.insertRow();
  row.insertCell(0).textContent = product.styleNumber;
  row.insertCell(1).textContent = product.size;
  row.insertCell(2).textContent = product.quantity;
  iframe.src="";
  searchbar.value="";
  // row.insertCell(3).textContent = product.quantity;
}

function updateDownloadButtonVisibility() {
  if (products.length > 0) {
    downloadCSVButton.style.display = "none";
  }
}

downloadCSVButton.addEventListener("click", function() {
  const csvContent = "Style Number,Color,Size,Quantity\n" + products.map(product => 
    `${product.styleNumber},${product.color},${product.size},${product.quantity}`
  ).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "inventory.csv";
  link.click();
});

document.getElementById("downloadBarcodes").addEventListener("click", async function() {
  const csvContent = "Barcode,Title,Label Type,Qty\n" +( await Promise.all(products.map(async (product) => {
    const title = await fetchTitle(product.styleNumber);
    const style_color = await fetchTitle(product.styleNumber);
    return `${generateBarcode(product.styleNumber,style_color.color, product.size)},${title.title},1 label 50mm x 25 mm on Roll - PDF,${product.quantity}`
  }))).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "BulkGenerateBarcodeLabels.csv";
  link.click();
});

function generateBarcode(styleNumber, color, size) {
  return `${styleNumber}-${color}-${size}`;
}

document.getElementById("downloadStock").addEventListener("click",async function() {
  const csvContent = "DropshipWarehouseId,Item SkuCode,InventoryAction,QtyIncludesBlocked,Qty,RackSpace,Last Purchase Price,Notes\n" +( await Promise.all(products.map(async (product) => {
    const style_color = await fetchTitle(product.styleNumber);
    return `22784,${generateBarcode(product.styleNumber,style_color.color, product.size)},ADD, ,${product.quantity}`
  }))).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "UpdateInStockQtyAnd_orLastPurchasePrice.csv";
  link.click();
});

// FIXED PART: Completed the 'downloadLabel' function
document.getElementById("downloadLabel").addEventListener("click", async function() {
  const csvContent = "Label Type,Sku Code,Sku Name,Brand,Color,Size,Unit,MRP,Qty,Custom Text\n" +( await Promise.all(products.map(async (product) => {
    const title = await fetchTitle(product.styleNumber);
    const style_color = await fetchTitle(product.styleNumber);
    const style_mrp = await fetchTitle(product.styleNumber);
    const custome_Text =`MFG & MKT BY: Qurvii. 2nd Floor. B149. Sector 6. Noida. UP. 201301`;
    return `50 mm x 25 mm on Roll - PDF,${generateBarcode(product.styleNumber,style_color.color, product.size)},${title.title},Qurvii,${style_color.color},${product.size},1 Pcs,${style_mrp.MRP},${product.quantity},${custome_Text}`
  }))).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "BulkGenerateProductRetailLabels.csv";
  link.click();
});


// searchbar 




// autopopulate searchbar value 
inputField.addEventListener('input', async () => {
  const inputVal = inputField.value.trim();
  if(inventoryData.length===0){
    await fetchProductData();
  }

  const allData = inventoryData.find(item=>item.style==inputVal);
  if(allData){
    console.log(allData.id);
    const src = `https://www.myntra.com/tops/qurvii/qurvii-colourblocked-flared-sleeves-top/${allData.id}/buy`;
    iframe.src = src;
    searchbar.value= allData.id;
    console.log(allData)
    // iframe.style.display="block";
    // window.open(src, "_blank");
  }
  else{
    console.log("No id found of this product")
  }


    console.log(inventoryData);
  
});


// // refesh button 
// document.querySelector('.refresh').addEventListener('click',async()=>{
//   const inputVal = inputField.value.trim();
//   if(inventoryData.length===0){
//     await fetchProductData();
//   }

//   const allData = inventoryData.find(item=>item.style==inputVal);
//   if(allData){
//     console.log(allData.id);
//     const src = `https://www.myntra.com/tops/qurvii/qurvii-colourblocked-flared-sleeves-top/${allData.id}/buy`;
//     iframe.src = src;
//     searchbar.value= allData.id;
//     console.log(allData)
//     window.open(src, "_blank");
//   }
//   else{
//     console.log("No id found of this product")
//   }


//     console.log(inventoryData);
  

// })