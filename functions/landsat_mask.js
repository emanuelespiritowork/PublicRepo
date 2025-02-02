/******************************************************
 * Author: Emanuele Spirito
 * Copyright: 2025
 * See latest stable version on my GitHub at 
 * https://github.com/emanuelespiritowork/gee-utils-scripts
*******************************************************/

/******************************************************
 * PURPOSE OF THIS SCRIPT
 * Input: ee.ImageCollection or ee.Image
 * Output: ee.ImageCollection or ee.Image
 * Description: apply cloud and snow mask to a Landsat 8/9 L2 image collection
 * or image
*******************************************************/

exports.landsat_mask = function(img_coll){
  
  img_coll = ee.ImageCollection(img_coll);
  
  var landsat_mask_img = function(image){
    var qa_pixel_layer = image.select("QA_PIXEL");
    
    var dilated_clouds = 1 << 1;
    var cirrus = 1 << 2;
    var cloud = 1 << 3;
    var cloud_shadow = 1 << 4;
    var snow = 1 << 5;
    
    var dilated_clouds_mask = qa_pixel_layer
    .bitwiseAnd(dilated_clouds).neq(0);
    var cirrus_mask = qa_pixel_layer
    .bitwiseAnd(cirrus).neq(0);
    var cloud_mask = qa_pixel_layer
    .bitwiseAnd(cloud).neq(0);
    var cloud_shadow_mask = qa_pixel_layer
    .bitwiseAnd(cloud_shadow).neq(0);
    var snow_mask = qa_pixel_layer
    .bitwiseAnd(snow).neq(0);
    
    var cloud_confidence_high = ee.Image(3 << 10);
    var cloud_confidence_medium = ee.Image(2 << 10);
    var snow_confidence_high = ee.Image(3 << 12);
    var snow_confidence_medium = ee.Image(2 << 12);
    
    var select_cloud_bit = qa_pixel_layer.bitwiseAnd(cloud_confidence_high);
    
    var cloud_confidence_high_mask = select_cloud_bit
    .eq(cloud_confidence_high);
    
    var cloud_confidence_medium_mask = select_cloud_bit
    .eq(cloud_confidence_medium);
    
    var select_snow_bit = qa_pixel_layer.bitwiseAnd(snow_confidence_high);
    
    var snow_confidence_high_mask = select_snow_bit
    .eq(snow_confidence_high);
    
    var snow_confidence_medium_mask = select_snow_bit
    .eq(snow_confidence_medium);
    
    //Apply masks
    
    var opposite_mask = ee.Image(0)
    .or(dilated_clouds_mask)
    .or(cirrus_mask)
    .or(cloud_mask)
    .or(cloud_shadow_mask)
    .or(snow_mask)
    .or(cloud_confidence_high_mask)
    .or(cloud_confidence_medium_mask)
    .or(snow_confidence_high_mask)
    .or(snow_confidence_medium_mask);
    //.or(image.select("SR_B2").multiply(0.0000275).add(-0.2).gt(5000));//my mask
    
    //creating the xor (1 will be not cloud pixel, 0 will be cloud pixel)
    var mask = opposite_mask.eq(0);
    
    return image.updateMask(mask);
  };
  
  return img_coll.map(landsat_mask_img);
};