package WebPages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class WeatherForecastPage {
	
	WebDriver driver;
	@FindBy(xpath = "//a[contains(@href,'current-weather')]")
	WebElement MoreDetails;
	
	public WeatherForecastPage(WebDriver driver)
	{
		this.driver=driver;
		PageFactory.initElements(driver, this);
	}
	
	public CurrentWeatherPage clickMoreDetails()
	{
		MoreDetails.click();
		if(driver.getCurrentUrl().contains("google_vignette"))
		{
			driver.navigate().refresh();
			MoreDetails.click();
		}
		return new CurrentWeatherPage(driver);
	}
	
}
