package FrameworkAssignment.WeatherReportingComparator;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;

public class Base {

	public WebDriver driver;

	public WebDriver initializeDriver() throws IOException {

		Properties prop = new Properties();
		FileInputStream fis = new FileInputStream(
				"C:\\Users\\nisha\\Documents\\WeatherReportingComparator\\WeatherReportingComparator\\src\\main\\java\\FrameworkAssignment\\WeatherReportingComparator\\Data.properties");
		prop.load(fis);
		String browserName = prop.getProperty("browser");
		String URL = prop.getProperty("url");

		if (browserName.equals("chrome")) {
			System.setProperty("webdriver.chrome.driver",
					"C:\\Users\\nisha\\Downloads\\chromedriver_win32\\chromedriver.exe");
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

}
