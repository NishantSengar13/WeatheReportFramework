package FrameworkAssignment.WeatherReportingComparator;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
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

	public WebDriver initializeDriver() throws IOException {
		String UserDir = System.getProperty("user.dir");
		Properties prop = new Properties();
		FileInputStream fis = new FileInputStream(UserDir+"\\src\\main\\java\\FrameworkAssignment\\WeatherReportingComparator\\Data.properties");
		prop.load(fis);
		String browserName = prop.getProperty("browser");
		String URL = prop.getProperty("url");
		String ChromeDriverPath = prop.getProperty("chromeDriverPath");

		if (browserName.equals("chrome")) {
			System.setProperty("webdriver.chrome.driver",UserDir+ChromeDriverPath);
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
