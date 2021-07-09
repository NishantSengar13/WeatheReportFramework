package apiRequests;

import apiConfigs.APIPath;
import io.restassured.RestAssured;
import io.restassured.response.Response;

public class GetRequest {
	
	public static String getRequest(String City)
	{
		Response response = RestAssured
		.given()
			.param("q", City)
			.param("units", "metric")
			.param("appid", "7fe67bf08c80ded756e598d6f8fedaea")
		.when()
			.get(APIPath.apiPath.GET_WEATHER);
		
		String json = response.asString();
		return json;
	}

}
