package FrameworkAssignment.WeatherReportingComparator;

import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Listeners;

import io.restassured.RestAssured;
import utils.ExtentReportListners;
import utils.FileandEnv;

@Listeners(ExtentReportListners.class)
public class Base extends ExtentReportListners {

	public WebDriver driver;

	public WebDriver initializeDriver() {
		
		String browserName = FileandEnv.envAndFile().get("Browser");
		String URL = FileandEnv.envAndFile().get("Url");
		String ChromeDriverPath = FileandEnv.envAndFile().get("ChromePath");

		if (browserName.equalsIgnoreCase("chrome")) {
			System.setProperty("webdriver.chrome.driver", ChromeDriverPath);
			driver = new ChromeDriver();
			driver.manage().window().maximize();
			driver.get(URL);
		}

		else if (browserName.equals("IE")) {
			System.setProperty("webdriver.edge.driver", "C:\\Users\\nisha\\Downloads\\MicrosoftWebDriver.exe");
			driver.manage().window().maximize();
			driver = new EdgeDriver();
		}

		driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
		return driver;
	}

	@BeforeClass
	public void baseUrl() {

		RestAssured.baseURI = FileandEnv.envAndFile().get("ServerUrl");

	}
	
	

	

}

