package WebPages;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;



public class HomePage {
	
		WebDriver driver;
		@FindBy(name = "query")
		WebElement searchBox;
		
		
		
		public HomePage(WebDriver driver) {
			this.driver = driver;
			PageFactory.initElements(driver, this);
		}



		public WeatherForecastPage EnterCity(String city, String state, String country)
		{
			searchBox.sendKeys(city+", "+state+", "+country);
			searchBox.sendKeys(Keys.ENTER);
			return (new WeatherForecastPage(driver));
			
		}
		
		

}
