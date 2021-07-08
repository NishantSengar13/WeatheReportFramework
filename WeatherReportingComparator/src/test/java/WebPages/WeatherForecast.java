package WebPages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class WeatherForecast {
	
	WebDriver driver;
	@FindBy(xpath = "//a[contains(@href,'current-weather')]")
	WebElement MoreDetails;
	
	public WeatherForecast(WebDriver driver)
	{
		this.driver=driver;
		PageFactory.initElements(driver, this);
	}
	
	public void clickMoreDetails()
	{
		MoreDetails.click();
	}
	
	

	
	

}
