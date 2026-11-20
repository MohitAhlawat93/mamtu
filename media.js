/* MAMTU / MEDIA INVENTORY
 * Verified repository files: images 1–8 and videos 1–3.
 * Hero order requested by owner: IMAGE 6 → IMAGE 3 → VIDEO 1.
 * Swap filenames here; all website sections read from this manifest.
 */
window.MAMTU_MEDIA = {
  imageDurationMs: 6000,
  videoDurationMs: 11000,
  telegram: "https://t.me/mistressmamtu",
  hero: [
    { type:"image", src:"/assets/images/6.jpeg", poster:"", alt:"Mamtu — selected photograph 6", title:"A little mystery" },
    { type:"image", src:"/assets/images/3.jpeg", poster:"", alt:"Mamtu — selected photograph 3", title:"A lasting impression" },
    { type:"video", src:"/assets/videos/1.mp4", poster:"/assets/images/6.jpeg", alt:"Mamtu — video 1", title:"Meet Mamtu in motion" }
  ],
  gallery: [
    { src:"/assets/images/6.jpeg", title:"In focus", alt:"Mamtu — photograph 6" },
    { src:"/assets/images/3.jpeg", title:"A little closer", alt:"Mamtu — photograph 3" },
    { src:"/assets/images/1.jpeg", title:"The collection", alt:"Mamtu — photograph 1" },
    { src:"/assets/images/2.jpeg", title:"A moment", alt:"Mamtu — photograph 2" },
    { src:"/assets/images/4.jpeg", title:"Behind the frame", alt:"Mamtu — photograph 4" },
    { src:"/assets/images/5.jpeg", title:"Quiet confidence", alt:"Mamtu — photograph 5" },
    { src:"/assets/images/7.jpeg", title:"Personal style", alt:"Mamtu — photograph 7" },
    { src:"/assets/images/8.jpeg", title:"The final frame", alt:"Mamtu — photograph 8" }
  ],
  films: [
    { src:"/assets/videos/1.mp4", poster:"/assets/images/6.jpeg", label:"Film 01" },
    { src:"/assets/videos/2.mp4", poster:"/assets/images/3.jpeg", label:"Film 02" },
    { src:"/assets/videos/3.mp4", poster:"/assets/images/7.jpeg", label:"Film 03" }
  ]
};
