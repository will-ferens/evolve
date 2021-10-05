// The two JSON strings below are returns of all single Evolve listing from two sources: The first is from
// Salesforce, our internal source of truth. The second is from Booking.com.

// Salesforce photos are returned in the order in which they were created, Booking.com returns them in the
// order in which they are displayed. Every photo returned from Booking.com is currently active, Salesforce
// returns all active and inactive photos.

// We need to do a few things with these objects:

// 1. Make sure all photos that are active in Salesforce are in the Booking.com object
// 2. Make sure ONLY photos that are active in Salesforce are in the Booking.com object
// 3. Make sure the order of photos in the Booking.com object follow the sort order of the Salesforce photos
// 4. Make sure the Main Photo in Booking.com is whichever active Salesforce photo has sort order 1
// 5. Return the BCPhotos object (or a new one) meeting the above criteria
//

var SFPhotos =
  '{\n    "SFPhotos": [\n    {\n        "id": "a0Ff200000MBUBFEA5",\n        "sort_order": 1,\n        "status": "Active"\n    },\n    {\n        "id": "a0Ff200000MBUBGEA5",\n        "sort_order": 5,\n        "status": "Active"\n    },\n    {\n        "id": "a0Ff200000MBUBHEA5",\n        "sort_order": 2,\n        "status": "Archived"\n    },\n    {\n        "id": "a0Ff200000MBUBIEA5",\n        "sort_order": 3,\n        "status": "Active"\n    },\n    {\n        "id": "a0Ff200000MBUBJEA5",\n        "sort_order": 4,\n        "status": "Active"\n    }\n    ]\n}';

var BCPhotos =
  '{\n    "BCPhotos": {\n      "order": [\n        {\n          "url": "https://supply-xml.booking.com/photo-api/properties/1234567890/photos/ALF95NB920ACXLS",\n          "name": "a0Ff200000MBUBFEA5",\n          "photo_id": "ALF95NB920ACXLS"\n        },\n        {\n          "url": "https://supply-xml.booking.com/photo-api/properties/1234567890/photos/VN49VL30GLH04J2",\n          "name": "a0Ff200000MBUBGEA5",\n          "photo_id": "VN49VL30GLH04J2"\n        },\n        {\n          "url": "https://supply-xml.booking.com/photo-api/properties/1234567890/photos/9430VNAV32VLDS9",\n          "name": "a0Ff200000MBUBHEA5",\n          "photo_id": "9430VNAV32VLDS9"\n        },\n        {\n            "url": "https://supply-xml.booking.com/photo-api/properties/1234567890/photos/VN49VL30GLH04F7",\n            "name": "a0Ff200000MBUBIEA5",\n            "photo_id": "VN49VL30GLH04F7"\n        },\n        {\n            "url": "https://supply-xml.booking.com/photo-api/properties/1234567890/photos/VN49VL30GLH03R4",\n            "name": "a0Ff200000MBUBJEA5",\n            "photo_id": "VN49VL30GLH03R4"\n        }\n      ],\n      "main_photo": {\n        "url": "https://supply-xml.booking.com/photo-api/properties/1234567890/photos/ALF95NB920ACXLS",\n        "name": "a0Ff200000MBUBFEA5",\n        "photo_id": "ALF95NB920ACXLS"\n      }\n    }\n}';

var SFPhotosObject = JSON.parse(SFPhotos);
var BCPhotosObject = JSON.parse(BCPhotos);

// 1. Make sure all photos that are active in Salesforce are in the Booking.com object

// checkActive returns true if all active status SFPhotos are present in the Booking.com object
function alterBCPhotos(sfObj, bcObj) {
  // sort SF photos to ensure top photo matches main BC photo
  let sfObjSorted = sortByOrder(sfObj.SFPhotos);
  // Reduce active photos IDs for easy comparison
  let sfActiveMap = createMap(sfObjSorted);
  // Add relevant SF sort_order value to BCphoto objects
  // leaving out any mismatching / non active photos
  let bcPhotosWithSortOrder = addSortOrder(bcObj.BCPhotos.order, sfActiveMap);
  // Sort BC photos by SF sort_order value
  let bcObjSorted = sortByOrder(bcPhotosWithSortOrder);
  // Alter bcObj array of photo objects
  bcObj.BCPhotos.order = bcObjSorted;
  // If main_photo in bcObj does not match first photo in SF obj,
  // swap
  if (bcObj.BCPhotos.main_photo.name !== sfObj.SFPhotos[0].id) {
    bcObj.BCPhotos.main_photo = sfObj.SFPhotos[0];
  }
  return bcObj;
}

function createMap(array) {
  return array.reduce((result, curr) => {
    if (curr.status === "Active") {
      result[curr.id] = curr;
    }
    return result;
  }, {});
}
function addSortOrder(array, map) {
  return array.reduce((prev, curr, i) => {
    if (map[curr.name]) {
      curr.sort_order = map[curr.name].sort_order;
      prev.push(curr);
    }
    return prev;
  }, []);
}
function sortByOrder(array) {
  return array.sort((a, b) => {
    return a.sort_order - b.sort_order;
  });
}
// Altered BCPhotosObject
let result = alterBCPhotos(SFPhotosObject, BCPhotosObject);
