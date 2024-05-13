function getDataDefaults(type){
	let defaults = {
		"apartment": {
			"status": "publish",
			"template": "",
			"acf": {
				"published": false,//checkbox
				"auto_filters": {//using page135
					"types_and_options": {
						"front_facing": false,
						"sea_view": true,
						"ground_floor": false,
						"private_patio": false,
						"terrace": false,
						"balcony": true,
						"pet_friendly": false
					},
					"accessibility": {
						"parking": true,
						"air_conditioner": true,
						"wifi": false,
						"microwave": true,
						"kitchen": true,
						"fridge": true,
						"tv": true,
						"shower": true,
						"bathtub": false,
						"zona_de_barbaco": false
					}
				},
				"inner_id": "",
				"floor": null,
				"number": "",
				"group": null,
				"bedroom": null, // bind to number of rooms
				"bathrooms": 2,
				"rooms": [
					{
						"room_type": "dormitorio",
						"beds": [
							{
								"bed": "double"
							}
						]
					},
					{
						"room_type": "dormitorio",
						"beds": [
							{
								"bed": "single"
							},
							{
								"bed": "single"
							}
						]
					}
				],
				"images": [
				],
			},
			"featured_media": null,//select from images
		},
		"group": {
		    "status": "publish",
		    "title": "",
		    "template": "",
		    "comodidades": [//number array
		    ],
		    "acf": {
		        "title": "",
		        "edificio": null,
		        "description": "",
		        "prices": {
		            "base_price": 200,
		            "promo_price": 100,
		            "season_prices": []
		        },
		        "images": [//id array
		        ],
		        "price_variants": [],
		        "additional_costs": [],
		        "advantages": [
		            // {
		            //     "image": 931,
		            //     "text": "Hasta 6 personas"
		            // },
		            // {
		            //     "image": 945,
		            //     "text": "Patio de juegos"
		            // },
		        ]
		    },
		},
		"building": {
		    "status": "publish",
		    "title": "",
		    "acf": {
		        "auto_filters": {
		            "location": {
		                "first_line": false,
		                "close_to_supermarket": false,
		                "close_to_center": false,
		                "close_to_pharmacy": false,
		                "close_to_aquatic_park": false
		            },
		            "servicios": {
		                "swimming_pull": true,
		                "play_area": true,
		                "garden": true
		            }
		        },
		        "title": "",
		        "area": null,
		        "images": [
		            // 608,
		            // 613,
		            // 617,
		            // 625,
		        ],
		        "seaside_position": "",
		        "locations": [
		            // {
		            //     "place": "Playa",
		            //     "distance": 50,
		            //     "unidades": "m"
		            // },
		        ],
		        "rules": [
		            // {
		            //     "title": "Llegada",
		            //     "image": 922,
		            //     "text": "De 16:00 a 19:00",
		            //     "description": "Tendrás que informar al establecimiento con antelación a qué hora llegarás."
		            // },
		            // {
		            //     "title": "Salida",
		            //     "image": 924,
		            //     "text": "De 10:00 a 12:00",
		            //     "description": "Debe informar al hotel con antelación de su hora de salida."
		            // },
		        ],
		        "address": ""
		    },
		}
	};
	return defaults[type];
} 

export default getDataDefaults;