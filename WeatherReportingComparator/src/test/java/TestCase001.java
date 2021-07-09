import java.io.IOException;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import com.relevantcodes.extentreports.LogStatus;

import FrameworkAssignment.WeatherReportingComparator.Base;
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

		double temp = cw.getTemperature();
		System.out.println(temp);

		double ftemp = cw.FeelsLike();
		double windSpeed = cw.getWindSpeed();
		double humidity = cw.getHumidity();
		double visibility = cw.getVisibility();
		double pressure = cw.getPressure();
		

		test.log(LogStatus.INFO, "Getting weather details from openweathermap API");
		JsonPath jsonpath = new JsonPath(GetRequest.getRequest(City));

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
		
		String result = ValueComparision.CompareTemp(Pressure, pressure, 0.0);
		
		System.out.println(result);

		test.log(LogStatus.INFO, "Test Ended");

		driver.close();

	}

}
