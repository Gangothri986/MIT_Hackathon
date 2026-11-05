// Image registry for AgroVision AI (Pure JavaScript)
// export const IMAGES = {
//   hero: '/frontend/src/assets/images/agro_hero_crop_1793801903141.jpg',
//   tomatoFlowering: '/frontend/src/assets/images/plant_tomato_flowering_1793801902356.jpg',
//   chilliVegetative: '/frontend/src/assets/images/plant_chilli_vegetative_1793801904672.jpg',
//   paddyField: '/frontend/src/assets/images/plant_paddy_field_1793801904802.jpg',
//   leafDisease: '/frontend/src/assets/images/leaf_disease_sample_1793801904523.jpg',
// };
export const IMAGES = {
  hero: new URL('./agro_hero_crop_1793801903141.jpg', import.meta.url).href,

  tomatoFlowering: new URL('./plant_tomato_flowering_1793801902356.jpg', import.meta.url).href,

  chilliVegetative: new URL('./plant_chilli_vegetative_1793801904672.jpg', import.meta.url).href,

  paddyField: new URL('./plant_paddy_field_1793801904802.jpg', import.meta.url).href,

  leafDisease: new URL('./leaf_disease_sample_1793801904523.jpg', import.meta.url).href,
};