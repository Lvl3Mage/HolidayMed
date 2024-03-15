const dataDefaults = {
	"apartment": {
		"status": "publish",
		"title": "Apartment Title",
		"template": "",
		"acf": {
			"auto_filters": {
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
			"inner_id": "Example id",
			"floor": 0,
			"number": "",
			"group": null,
			"bedroom": 2,
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
		"featured_media": null,
	},
};
export default dataDefaults;