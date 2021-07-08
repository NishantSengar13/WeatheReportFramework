import java.io.IOException;
import java.text.ParseException;

import org.omg.Messaging.SyncScopeHelper;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.relevantcodes.extentreports.LogStatus;

import FrameworkAssignment.WeatherReportingComparator.Base;
import WebPages.CurrentWeatherPage;
import WebPages.HomePage;
import WebPages.WeatherForecastPage;
import apiConfigs.APIPath;

import io.restassured.RestAssured;
import io.restassured.RestAssured.*;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

public class TestCase001 extends Base {

	@BeforeTest
	public void Before_Test() throws IOException {

		driver = initializeDriver();

	}

	@Test
	public void GetWeatherDetails() {

		test.log(LogStatus.INFO, "Getting weather details from Accuweather.com");
		HomePage hp = new HomePage(driver);
		WeatherForecastPage wf = hp.EnterCity("Ahmedabad", "Gujarat", "India");
		CurrentWeatherPage cw = wf.clickMoreDetails();

		double temp = cw.getTemperature();
		System.out.println(temp);

		double ftemp = cw.FeelsLike();
		System.out.println(ftemp);

		double windSpeed = cw.getWindSpeed();
		System.out.println(windSpeed);

		double humidity = cw.getHumidity();
		System.out.println(humidity);

		double visibility = cw.getVisibility();
		System.out.println(visibility);

		double pressure = cw.getPressure();
		System.out.println(pressure);

		test.log(LogStatus.INFO, "Getting weather details from openweathermap API");
		Response res = RestAssured.given().param("q", "Ahmedabad").param("units", "metric")
				.param("appid", "7fe67bf08c80ded756e598d6f8fedaea").when().get(APIPath.apiPath.GET_WEATHER);

		String json = res.asString();

		JsonPath jsonpath = new JsonPath(json);

		Double temperature = jsonpath.getDouble("main.temp");
		test.log(LogStatus.INFO, "Temperature API : " + temperature +"       "+"Web : "+temp);
		//test.log(LogStatus.INFO, "Temperature : " + temperature);
		Double FeelsLike = jsonpath.getDouble("main.feels_like");
		test.log(LogStatus.INFO, "FeelsLike API : " + FeelsLike+"       "+"Web : "+ftemp);
		Double Pressure = jsonpath.getDouble("main.pressure");
		test.log(LogStatus.INFO, "Pressure API : " + Pressure+"       "+"Web : "+pressure);
		Double Humidity = jsonpath.getDouble("main.humidity");
		test.log(LogStatus.INFO, "Humidity API : " + Humidity+"       "+"Web : "+humidity);
		Double Visibility = jsonpath.getDouble("visibility");
		test.log(LogStatus.INFO, "Visibility API : " + Visibility+"       "+"Web : "+visibility);
		Double WindSpeed = jsonpath.getDouble("wind.speed");
		test.log(LogStatus.INFO, "WindSpeed API : " + WindSpeed+"       "+"Web : "+windSpeed);

		test.log(LogStatus.INFO, "My test is ended......");

		driver.close();

	}

}
