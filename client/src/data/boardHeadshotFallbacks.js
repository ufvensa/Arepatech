import valeriaCadaviecoImg from "../images/Valeria Cadavieco headshot pic.jpeg";
import sofiaAlamoImg from "../images/Sofia Alamo.jpeg";
import rodrigoBlancoImg from "../images/Rodrigo Blanco headshot pic.jpeg";
import josePulidoImg from "../images/Jose Pulido headshot pic.jpeg";
import mariaCarreroImg from "../images/Maria Carrera headshot pic.jpeg";
import federicaSosaImg from "../images/Federica Sosa headshot pic.jpeg";
import valentinaJedlickaImg from "../images/Valentina Jedlicka headshot pic.jpeg";
import victoriaMedinaImg from "../images/Victoria Medina headshot pic.jpeg";
import aidanLeImg from "../images/Aiden Le headshot pic.jpeg";
import anyelinaJimenezImg from "../images/Anyelina Jimenez headshot pic.jpeg";
import anaVegasImg from "../images/Ana Vegas headshot pic.jpeg";
import fabioJorgeImg from "../images/Fabio Jorge headshot pic.jpeg";
import andyArveloImg from "../images/Andy Arvelo headshot pic.JPG";

// Temporary local image fallbacks. E-Board membership and profile details come
// exclusively from Supabase; these entries are used only when avatar_url is empty.
const BOARD_HEADSHOT_FALLBACKS = {
  "v.cadavieco@ufl.edu": { image: valeriaCadaviecoImg },
  "alamosofia@ufl.edu": { image: sofiaAlamoImg },
  "rodrigoblanco@ufl.edu": { image: rodrigoBlancoImg },
  "pulido.jd@ufl.edu": { image: josePulidoImg },
  "mcarrerojimenez@ufl.edu": { image: mariaCarreroImg },
  "federica.sosa@ufl.edu": { image: federicaSosaImg, imagePosition: "center 28%" },
  "vjedlicka@ufl.edu": { image: valentinaJedlickaImg },
  "vmedinalaguado@ufl.edu": { image: victoriaMedinaImg },
  "aidanle@ufl.edu": { image: aidanLeImg, imagePosition: "center 30%" },
  "jimenez.a1@ufl.edu": { image: anyelinaJimenezImg },
  "anavegas@ufl.edu": { image: anaVegasImg },
  "f.jorgehernandez@ufl.edu": { image: fabioJorgeImg },
  "aarveloferreira@ufl.edu": { image: andyArveloImg },
};

export function getBoardHeadshotFallback(email) {
  return BOARD_HEADSHOT_FALLBACKS[String(email || "").trim().toLowerCase()] || null;
}
