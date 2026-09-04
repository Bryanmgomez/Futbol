/* ============================================================
   PISCINAS DE NOMBRES — ¡EDITA AQUÍ PARA AÑADIR NOMBRES!
   ============================================================
   Cada país tiene nombres y apellidos propios. Los jugadores de
   cada club se generan combinándolos al azar.
   Codes: ar=Argentina br=Brasil co=Colombia cl=Chile pe=Perú
          uy=Uruguay ec=Ecuador py=Paraguay bo=Bolivia ve=Venezuela
es=España en=Inglaterra it=Italia de=Alemania fr=Francia
           pt=Portugal nl=Países Bajos mx=México us=Estados Unidos
           cn=China jp=Japón ru=Rusia
           ot=Otros (internacional)
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});

  G.namePools = {
    ar: {
      first: ["Lautaro", "Mati", "Nicolás", "Agustín", "Julián", "Thiago", "Franco", "Gonzalo", "Lucas", "Brian", "Exequiel", "Pablo", "Rodrigo", "Emiliano", "Gabriel", "Cristian"],
      last: ["Giménez", "Álvarez", "Palacios", "Acuña", "Molina", "Fernández", "Romero", "Martínez", "Correa", "De Paul", "Paredes", "Otamendi", "Tagliafico", "Lo Celso", "Medina", "Cavani"],
    },
    br: {
      first: ["Gabriel", "Matheus", "Vinícius", "Lucas", "Bruno", "Rafael", "Kaique", "Weverton", "Douglas", "Wallisson", "Pedro", "Ewerton", "Denílson", "Alisson", "Yuri", "Igor"],
      last: ["Silva", "Santos", "Oliveira", "Souza", "Ribeiro", "Almeida", "Costa", "Pereira", "Menezes", "Barbosa", "Lima", "Ferreira", "Carvalho", "Moreira", "Gomes", "Cardoso"],
    },
    co: {
      first: ["Jhon", "Luis", "Daniel", "Yerson", "Juan", "Kevin", "Carlos", "Andrés", "Santiago", "Sebastián", "Eduard", "Miguel", "Felipe", "Johan", "Yeison", "Dávinson"],
      last: ["Córdoba", "Arias", "Lerma", "Díaz", "Rodríguez", "Muñoz", "Valencia", "Lucumí", "Caicedo", "Zapata", "Umaña", "Palacios", "Vargas", "Mosquera", "Chará", "Moreno"],
    },
    cl: {
      first: ["Bastían", "Darío", "Esteban", "Diego", "Joao", "Carlos", "Matías", "Víctor", "Benjamín", "Cristián", "Fabián", "Marcelo", "Ignacio", "Gonzalo", "Alfonso", "Tomás"],
      last: ["Díaz", "Medel", "Vidal", "Mena", "Llona", "Suazo", "Vivar", "Zapata", "Meneses", "Barrios", "Rebolledo", "Fuentes", "Espinoza", "POBLETE", "Rojas", "Contreras"],
    },
    pe: {
      first: ["Pedro", "Gianluca", "Alexander", "Marcos", "Alan", "Antonio", "Paolo", "Renato", "Miguel", "Carlos", "Diego", "Yordy", "Aldo", "Frank", "Jean", "José"],
      last: ["Guerrero", "Valera", "Cueva", "López", "Tapia", "Arias", "Cartagena", "Advíncula", "Ruidíaz", "Carrillo", "Trauco", "Santamaría", "Ramos", "Sotil", "Zambrano", "Farfán"],
    },
    uy: {
      first: ["Federico", "Nahitan", "Rodrigo", "Diego", "Agustín", "Matías", "Giorgian", "Edinson", "Bruno", "Sebastián", "Cristhian", "Guillermo", "Maximiliano", "Franco", "Santiago", "Nicolás"],
      last: ["Valverde", "Nández", "Bentancur", "Gómez", "Olivera", "Vecino", "Torreira", "Araújo", "Giménez", "Suárez", "Méndez", "Roncón", "De Arrascaeta", "Pellistri", "Lacoponi", "Ugarte"],
    },
    ec: {
      first: ["Moisés", "Kendry", "Pervis", "Enner", "Ángelo", "Alan", "Jhegson", "Gonzalo", "Carlos", "Jeremy", "Luis", "Marlon", "Christian", "Jhon", "Anthony", "Éder"],
      last: ["Caicedo", "Páez", "Estupiñán", "Valencia", "Preciado", "Franco", "Méndez", "Plata", "Grillo", "Sarmiento", "Cifuentes", "Herrera", "Palacios", "Castillo", "Corozo", "Quintero"],
    },
    py: {
      first: ["Miguel", "Antonio", "Damián", "Julio", "Gustavo", "Mathias", "Derlis", "Jorge", "Nícolás", "Breiner", "Óscar", "Santiago", "Matías", "Álvaro", "Richard", "Robert"],
      last: ["Almirón", "Sanabria", "Villásanti", "Cardozo", "Rojas", "Valdez", "Ortega", "Piris", "Ávalos", "Árias", "Estigarribia", "Bobadilla", "Romero", "Benítez", "Fernández", "González"],
    },
    bo: {
      first: ["César", "Marcelo", "Ramiro", "Bruno", "Enzo", "Leonardo", "Javier", "Juan", "Henry", "Rolando", "Diego", "Alejandro", "Pablo", "Gustavo", "Rubén", "Carlos"],
      last: ["Vaca", "Rocha", "Ramallo", "Méndez", "Justiniano", "Fernández", "Moreno", "Sagredo", "Cuéllar", "Bejarano", "Savaresse", "Alvarez", "Terrazas", "Gómez", "Flores", "Quiroga"],
    },
    ve: {
      first: ["Yangel", "Salomón", "Jhon", "Yeferson", "José", "Junior", "Ronald", "Christian", "Alexander", "Ángel", "Wilker", "Erick", "Samuel", "Roiner", "Edson", "Diego"],
      last: ["Herrera", "Rondón", "Murillo", "Soteldo", "Machís", "Vargas", "Añor", "Moreno", "Cádiz", "González", "Osorio", "Fuenmayor", "Peña", "Zambrano", "Rosales", "Rincón"],
    },
    es: {
      first: ["Álvaro", "Pablo", "Rodri", "Mikel", "Nico", "Pedri", "Dani", "Marcos", "Unai", "Alejandro", "Javi", "Iker", "Sergio", "Marc", "Ferran", "Gavi"],
      last: ["García", "Fernández", "Rodríguez", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Navarro", "Díaz", "Torres", "Ruiz", "Ramírez", "Moreno", "Suárez", "Vega"],
    },
    en: {
      first: ["Harry", "Jack", "Jude", "Marcus", "Phil", "Bukayo", "Cole", "Declan", "Trent", "Jordan", "Reece", "Mason", "Ben", "Jordan", "Kyle", "Ollie"],
      last: ["Walker", "Saka", "Palmer", "Mainoo", "Foden", "Kane", "Rashford", "Bellingham", "Stones", "Rice", "Maddison", "Watkins", "Bowen", "Gordon", "White", "Tomori"],
    },
    it: {
      first: ["Nicolò", "Sandro", "Federico", "Gianluigi", "Lorenzo", "Davide", "Matteo", "Marco", "Alessandro", "Andrea", "Giacomo", "Riccardo", "Moise", "Bryan", "Manuel", "Guglielmo"],
      last: ["Barella", "Tonali", "Chiesa", "Donnarumma", "Pellegrini", "Locatelli", "Bastoni", "Cristante", "Di Lorenzo", "Raspadori", "Scamacca", "Frattesi", "Retegui", "Vicario", "Buongiorno", "Kean"],
    },
    de: {
      first: ["Jamal", "Florian", "Kai", "Leon", "Joshua", "Niklas", "Antonio", "Leroy", "Serge", "Nico", "Pascal", "Robin", "David", "Tim", "Maximilian", "Aleksandar"],
      last: ["Wirtz", "Musiala", "Kimmich", "Goretzka", "Kroos", "Gündogan", "Havertz", "Sané", "Ter Stegen", "Schlotterbeck", "Tah", "Koch", "Rüdiger", "Flekken", "Raum", "Grimaldo"],
    },
    fr: {
      first: ["Kylian", "Aurélien", "Ousmane", "Eduardo", "William", "Ibrahima", "Jules", "Dayot", "Randal", "Marcus", "Antoine", "Rayan", "Michael", "Adrien", "Theo", "Lucas"],
      last: ["Mbappé", "Tchouaméni", "Dembélé", "Camavinga", "Saliba", "Konaté", "Koundé", "Upamecano", "Kolo Muani", "Thuram", "Griezmann", "Cherki", "Olise", "Rabiot", "Hernández", "Digne"],
    },
    pt: {
      first: ["Rafael", "João", "Bernardo", "Bruno", "Rúben", "Diogo", "Gonçalo", "Vitinha", "Pedro", "Francisco", "António", "Nuno", "Cristiano", "Ricardo", "Tiago", "André"],
      last: ["Fernandes", "Silva", "Neves", "Dias", "Costa", "Cancelo", "Ramos", "Jota", "Leão", "Palhinha", "Núñez", "Mendes", "Félix", "Horta", "Bruma", "Semedo"],
    },
    nl: {
      first: ["Frenkie", "Virgil", "Cody", "Xavi", "Memphis", "Denzel", "Stefan", "Jorrit", "Tijjani", "Micky", "Bart", "Nathan", "Wout", "Kenneth", "Jeremie", "Quilindschy"],
      last: ["de Jong", "van Dijk", "Gakpo", "Simons", "Depay", "Dumfries", "de Vrij", "Hendrix", "Reijnders", "van de Ven", "Verbruggen", "Aké", "Malen", "Taylor", "Frimpong", "Hartman"],
    },
    mx: {
      first: ["Santiago", "Luis", "Edson", "César", "Javier", "Hirving", "Raúl", "Orbelín", "Carlos", "Johan", "Gilberto", "Julián", "Henry", "Alexis", "Roberto", "Tecatito"],
      last: ["Giménez", "Álvarez", "Edson", "Montes", "Hernández", "Lozano", "Jiménez", "Pineda", "Rodríguez", "Vázquez", "Sepúlveda", "Quiñones", "Martín", "Vega", "Alvarado", "Corona"],
    },
    us: {
      first: ["Christian", "Weston", "Tyler", "Gio", "Timothy", "Ricardo", "Antonee", "Matt", "Brenden", "Cade", "Folarin", "Johnny", "Djordje", "Paxton", "Brandon", "Caleb"],
      last: ["Pulisic", "McKennie", "Adams", "Reyna", "Weah", "Pepi", "Robinson", "Turner", "Aaronson", "Cowell", "Balogun", "Cardoso", "Mihailovic", "Aaronson", "Vazquez", "Wiley"],
    },
    ot: {
      first: ["Luka", "Adam", "Max", "Ibrahim", "David", "Leo", "Marco", "Rúben", "Ander", "Wesley", "Malcolm", "Kento", "Seán", "Lars", "Timo", "Oussama"],
      last: ["Santana", "Hernández", "García", "Rossi", "Kova", "Mori", "Bakker", "Stevens", "Nkoudou", "Araki", "Petit", "Warner", "López", "Sosa", "Ferreira", "Novak"],
    },
    cn: {
      first: ["Yuhang", "Zhen", "Wei", "Jun", "Ming", "Lei", "Hao", "Lin", "Yang", "Chao", "Jie", "Yu", "Bo", "Kai", "Tao", "En"],
      last: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu", "Guo"],
    },
    jp: {
      first: ["Daiki", "Ritsu", "Kaoru", "Takefusa", "Ao", "Wataru", "Hidemasa", "Junya", "Takumi", "Yuta", "Koki", "Ayase", "Kyogo", "Reo", "Keito", "Ryo"],
      last: ["Mitoma", "Kubo", "Minamino", "Tomiyasu", "Doan", "Endo", "Morita", "Kamada", "Nakayama", "Ueda", "Furuhashi", "Hatate", "Ito", "Machida", "Sano", "Hasebe"],
    },
    ru: {
      first: ["Aleksandr", "Fedor", "Daniil", "Matvei", "Artem", "Ivan", "Sergei", "Dmitri", "Aleksei", "Roman", "Nikolai", "Mikhail", "Pavel", "Vladimir", "Yuri", "Anton"],
      last: ["Golovin", "Bakaev", "Dzyuba", "Miranchuk", "Chalov", "Smolov", "Akinfeev", "Barinov", "Zhirkov", "Fomin", "Sobolev", "Karpin", "Tikhonov", "Kokorin", "Shunin", "Latyshev"],
    },
  };

  // Evita apellidos con mayúsculas mal escritas.
  G.namePools.cl.last[13] = "Poblete";
})();