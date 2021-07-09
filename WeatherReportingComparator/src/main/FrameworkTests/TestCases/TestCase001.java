package TestCases;
import java.io.IOException;

import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.relevantcodes.extentreports.LogStatus;

import TestCases.Base;
import WebPages.CurrentWeatherPage;
import WebPages.HomePage;
import WebPages.WeatherForecastPage;
import apiRequests.GetRequest;
import io.restassured.path.json.JsonPath;
import utils.FileandEnv;
import utils.ValueComparision;

public class TestCase001 extends Base {

	@BeforeTest
	public void Before_Test() throws IOException {

		driver = initializeDriver();

	}

	@Test
	public void GetWeatherDetails() {

		String City = FileandEnv.envAndFile().get("City");
		String State = FileandEnv.envAndFile().get("State");
		String Country = FileandEnv.envAndFile().get("Country");

		test.log(LogStatus.INFO, "Test Started");
		test.log(LogStatus.INFO, "Getting weather details from Accuweather.com");
		HomePage hp = new HomePage(driver);
		WeatherForecastPage wf = hp.EnterCity(City, State, Country);
		CurrentWeatherPage cw = wf.clickMoreDetails();

		double W_temp = cw.getTemperature();
		double W_ftemp = cw.FeelsLike();
		double W_windSpeed = cw.getWindSpeed();
		double W_humidity = cw.getHumidity();
		double W_visibility = cw.getVisibility();
		double W_pressure = cw.getPressure();

		test.log(LogStatus.INFO, "Getting weather details from openweathermap API");
		JsonPath jsonpath = new JsonPath(GetRequest.getRequest(City));

		Double A_temp = jsonpath.getDouble("main.temp");
		test.log(LogStatus.INFO, "Temperature API : " + A_temp + "       " + "Web : " + W_temp);
		Double A_ftemp = jsonpath.getDouble("main.feels_like");
		test.log(LogStatus.INFO, "FeelsLike API : " + A_ftemp + "       " + "Web : " + W_ftemp);
		Double A_pressure = jsonpath.getDouble("main.pressure");
		test.log(LogStatus.INFO, "Pressure API : " + A_pressure + "       " + "Web : " + W_pressure);
		Double A_humidity = jsonpath.getDouble("main.humidity");
		test.log(LogStatus.INFO, "Humidity API : " + A_humidity + "       " + "Web : " + W_humidity);
		Double A_visibility = jsonpath.getDouble("visibility");
		test.log(LogStatus.INFO, "Visibility API : " + A_visibility + "       " + "Web : " + W_visibility);
		Double A_windSpeed = jsonpath.getDouble("wind.speed");
		test.log(LogStatus.INFO, "WindSpeed API : " + A_windSpeed + "       " + "Web : " + W_windSpeed);

		String result = ValueComparision.CompareTemp(A_temp, W_temp, 2.0);
		Assert.assertEquals(result, "Passed");

		test.log(LogStatus.INFO, "Test Ended");

	}

	@AfterTest
	public void After_Test() {
		driver.quit();
	}

}