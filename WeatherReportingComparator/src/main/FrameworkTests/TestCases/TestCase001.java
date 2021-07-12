package TestCases;

import java.io.IOException;

import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.aventstack.extentreports.Status;

import apiRequests.GetRequest;
import io.restassured.path.json.JsonPath;
import pageFactory.CurrentWeatherPage;
import pageFactory.HomePage;
import pageFactory.WeatherForecastPage;
import utils.ExtentTestManager;
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

		ExtentTestManager.getTest().log(Status.INFO, "Test Started");
		ExtentTestManager.getTest().log(Status.INFO, "Getting weather details from Accuweather.com");
		HomePage hp = new HomePage(driver);
		WeatherForecastPage wf = hp.EnterCity(City, State, Country);
		CurrentWeatherPage cw = wf.clickMoreDetails();

		double W_temp = cw.getTemperature();
		double W_ftemp = cw.FeelsLike();
		double W_windSpeed = cw.getWindSpeed();
		double W_humidity = cw.getHumidity();
		double W_visibility = cw.getVisibility();
		double W_pressure = cw.getPressure();

		ExtentTestManager.getTest().log(Status.INFO, "Getting weather details from openweathermap API");
		JsonPath jsonpath = new JsonPath(GetRequest.getRequest(City));

		Double A_temp = jsonpath.getDouble("main.temp");
		ExtentTestManager.getTest().log(Status.INFO, "Temperature API : " + A_temp + "       " + "Web : " + W_temp);
		Double A_ftemp = jsonpath.getDouble("main.feels_like");
		ExtentTestManager.getTest().log(Status.INFO, "FeelsLike API : " + A_ftemp + "       " + "Web : " + W_ftemp);
		Double A_pressure = jsonpath.getDouble("main.pressure");
		ExtentTestManager.getTest().log(Status.INFO, "Pressure API : " + A_pressure + "       " + "Web : " + W_pressure);
		Double A_humidity = jsonpath.getDouble("main.humidity");
		ExtentTestManager.getTest().log(Status.INFO, "Humidity API : " + A_humidity + "       " + "Web : " + W_humidity);
		Double A_visibility = jsonpath.getDouble("visibility");
		ExtentTestManager.getTest().log(Status.INFO, "Visibility API : " + A_visibility + "       " + "Web : " + W_visibility);
		Double A_windSpeed = jsonpath.getDouble("wind.speed");
		ExtentTestManager.getTest().log(Status.INFO, "WindSpeed API : " + A_windSpeed + "       " + "Web : " + W_windSpeed);
		
		//We can compare any of the above six weather conditions as below where third argument is variance
		String result = ValueComparision.CompareTemp(A_temp, W_temp, 2.0);
		Assert.assertEquals(result, "Passed");

		ExtentTestManager.getTest().log(Status.INFO, "Test Ended");

	}

	@AfterTest
	public void After_Test() {
		driver.quit();
	}

}
