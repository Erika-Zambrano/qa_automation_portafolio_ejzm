export type ArtImage = { src: string; title: string; creator: string; page: string; licence: string; alt?: string };

export const ART: Record<number, ArtImage> = {
  1: { src: '/art/1.jpg', title: "Strolling along the Seashore", creator: "Joaquín Sorolla", page: "https://commons.wikimedia.org/wiki/File:Joaqu%C3%ADn_Sorolla_y_Bastida_-_Strolling_along_the_Seashore_-_Google_Art_Project.jpg", licence: "public domain" },
  2: { src: '/art/2.jpg', title: 'Cala de San Vicente, Mallorca', creator: 'Joaquín Sorolla', page: 'https://commons.wikimedia.org/wiki/File:Sorolla_Cala_de_San_Vicente,_Mallorca_1919_Es_Baluard.gif', licence: 'public domain', alt: 'Cala de San Vicente, Mallorca, Joaquín Sorolla' },
  3: { src: '/art/3.jpg', title: "The Scream of Nature", creator: "Edvard Munch", page: "https://commons.wikimedia.org/wiki/File:The_Scream_Pastel.jpg", licence: "public domain" },
  6: { src: '/art/6.jpg', title: "The Starry Night", creator: "Vincent van Gogh", page: "https://commons.wikimedia.org/wiki/File:VanGogh-starry_night_ballance1.jpg", licence: "public domain" },
  9: { src: '/art/9.jpg', title: "The Night Watch", creator: "Rembrandt", page: "https://commons.wikimedia.org/wiki/File:La_ronda_de_noche,_por_Rembrandt_van_Rijn.jpg", licence: "public domain" },
  10: { src: '/art/10.jpg', title: "Still Life: Vase with Twelve Sunflowers", creator: "Vincent van Gogh", page: "https://commons.wikimedia.org/wiki/File:Vincent_Willem_van_Gogh_128.jpg", licence: "public domain" },
  11: { src: '/art/11.jpg', title: "The Anatomy Lesson of Dr. Nicolaes Tulp", creator: "Rembrandt", page: "https://commons.wikimedia.org/wiki/File:Rembrandt_-_The_Anatomy_Lesson_of_Dr._Nicolaes_Tulp.jpg", licence: "public domain" },
  12: { src: '/art/12.jpg', title: "Composition VII", creator: "Wassily Kandinsky", page: "https://commons.wikimedia.org/wiki/File:Vassily_Kandinsky,_1913_-_Composition_7.jpg", licence: "public domain" },
  13: { src: '/art/13.jpg', title: "Yellow-Red-Blue", creator: "Wassily Kandinsky", page: "https://commons.wikimedia.org/wiki/File:Kandinsky_-_Jaune_Rouge_Bleu.jpg", licence: "public domain" },
  14: { src: '/art/14.jpg', title: "On White II", creator: "Wassily Kandinsky", page: "https://commons.wikimedia.org/wiki/File:Vassily_Kandinsky,_1923_-_On_White_II.jpg", licence: "public domain" },
  15: { src: '/art/15.jpg', title: "Miranda en La Carraca", creator: "Arturo Michelena", page: "https://commons.wikimedia.org/wiki/File:Miranda_en_la_Carraca_by_Arturo_Michelena.jpg", licence: "public domain" },
  4: { src: '/art/4.jpg', title: 'The Two Fridas', creator: 'Frida Kahlo', page: 'https://en.wikipedia.org/wiki/File:The_Two_Fridas.jpg', licence: 'used for a non-commercial portfolio exercise' },
  5: { src: '/art/5.jpg', title: 'Self-Portrait with Thorn Necklace and Hummingbird', creator: 'Frida Kahlo', page: 'https://en.wikipedia.org/wiki/File:Frida_Kahlo_(self_portrait).jpg', licence: 'used for a non-commercial portfolio exercise', alt: 'Autorretrato con collar de espinas y colibrí, Frida Kahlo' },
  7: { src: '/art/7.jpg', title: 'Guernica', creator: 'Pablo Picasso', page: 'https://en.wikipedia.org/wiki/File:PicassoGuernica.jpg', licence: 'used for a non-commercial portfolio exercise' },
  8: { src: '/art/8.jpg', title: "Les Demoiselles d'Avignon", creator: 'Pablo Picasso', page: 'https://en.wikipedia.org/wiki/File:Les_Demoiselles_d%27Avignon.jpg', licence: 'used for a non-commercial portfolio exercise' },
  16: { src: '/art/16.jpg', title: 'Obra de Cruz-Díez en La Hechicera ULA', creator: 'Carlos Cruz-Diez', page: 'https://commons.wikimedia.org/wiki/File:Obra_de_Cruz-D%C3%ADez_en_La_Hechicera_ULA.jpg', licence: 'photo via Wikimedia Commons; see source page' },
  17: { src: '/art/17.jpg', title: 'Fisicromía Cóncavo-convexa', creator: 'Carlos Cruz-Diez', page: 'https://commons.wikimedia.org/wiki/File:Fisicrom%C3%ADa_C%C3%B3ncavo-convexa.jpg', licence: 'photo via Wikimedia Commons; see source page' },
  18: { src: '/art/18.jpg', title: 'Cruz-Diez, Grand Palais 2013', creator: 'Carlos Cruz-Diez', page: 'https://commons.wikimedia.org/wiki/File:Cruz-Diez_2013_Grand_Palais_Paris_France.jpg', licence: 'photo via Wikimedia Commons; see source page' },
};
