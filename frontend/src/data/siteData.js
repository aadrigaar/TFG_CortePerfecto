import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  Crown,
  MapPin,
  Palette,
  Scissors,
  Sparkles,
  Star
} from "lucide-react";

export const services = [
  {
    name: "Corte",
    title: "Corte",
    description: "Corte clasico o moderno adaptado a tu estilo. Incluye lavado y acabado final con productos profesionales.",
    price: 20,
    duration: 30,
    Icon: Scissors,
    popular: false
  },
  {
    name: "Tinte",
    title: "Tinte",
    description: "Coloracion profesional con las mejores marcas del mercado. Resultados naturales y duraderos.",
    price: 40,
    duration: 60,
    Icon: Palette,
    popular: true
  },
  {
    name: "Peinado",
    title: "Peinado",
    description: "Peinado para cualquier ocasion, desde el dia a dia hasta eventos especiales. Tu decides el look.",
    price: 15,
    duration: 20,
    Icon: Sparkles,
    popular: false
  }
];

export const combos = [
  {
    name: "Corte y Peinado",
    services: "Corte + Peinado",
    price: 35,
    label: "LOOK COMPLETO",
    Icon: Sparkles
  },
  {
    name: "Tinte y Peinado",
    services: "Tinte + Peinado",
    price: 55,
    label: "PACK COMPLETO",
    Icon: BadgeCheck
  },
  {
    name: "Corte y Tinte",
    services: "Corte + Tinte",
    price: 60,
    label: "EL MAS PEDIDO",
    featured: true,
    Icon: Star
  },
  {
    name: "Corte + Tinte + Peinado",
    services: "Corte + Tinte + Peinado",
    price: 75,
    label: "PACK TOTAL",
    Icon: Crown
  }
];

export const features = [
  {
    Icon: Clock,
    title: "Horario amplio",
    text: "Lunes a Viernes de 10:00 a 20:00"
  },
  {
    Icon: CalendarCheck,
    title: "Reserva con IA",
    text: "Chatbot disponible 24/7 para consultas"
  },
  {
    Icon: Star,
    title: "Alta valoracion",
    text: "4.9 estrellas en Google Reviews"
  },
  {
    Icon: Sparkles,
    title: "Productos premium",
    text: "Solo marcas profesionales certificadas"
  }
];

export const testimonials = [
  {
    name: "Maria Lopez",
    service: "CORTE",
    quote: "Increible experiencia. El chatbot me reservo la cita en 30 segundos y el corte fue perfecto. Repetire seguro."
  },
  {
    name: "Carlos Ruiz",
    service: "TINTE",
    quote: "Llevaba anos buscando una peluqueria de confianza en Santander. Corte Perfecto ha superado todas mis expectativas."
  },
  {
    name: "Ana Martinez",
    service: "PEINADO",
    quote: "El peinado para mi boda quedo espectacular. Todo el equipo es super profesional y atento. 100% recomendable."
  },
  {
    name: "Javier Gomez",
    service: "CORTE Y TINTE",
    quote: "Lo mas comodo es poder reservar con el chatbot a cualquier hora del dia. Tecnologia al servicio del cliente."
  }
];

export const contact = {
  address: "Calle Mayor 42, Santander",
  phone: "+34 942 000 000",
  schedule: "L-V: 10:00-20:00",
  location: "Santander, Cantabria",
  Icon: MapPin
};

