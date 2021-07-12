package pageFactory;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class CurrentWeatherPage {
	
	WebDriver driver;
	
	@FindBy(xpath = "//div[contains(@class,'display-temp')]")
	WebElement temperature;
	
	@FindBy(xpath = "//div[contains(@class,'current-weather-extra')]//div[1]")
	WebElement feelslike;
	
	@FindBy(xpath = "//div[contains(text(),'Wind')]/following-sibling::div")
	WebElement wind;
	
	@FindBy(xpath = "//div[contains(text(),'Humidity')]/following-sibling::div")
	WebElement humidity;
	
	@FindBy(xpath = "//div[contains(text(),'Visibility')]/following-sibling::div")
	WebElement visibility;
	
	@FindBy(xpath = "//div[contains(text(),'Pressure')]/following-sibling::div")
	WebElement pressure;
	
	public CurrentWeatherPage(WebDriver driver) {
		this.driver = driver;
		PageFactory.initElements(driver, this);
	}
	
	public double getTemperature()
	{
		String TempWeb = temperature.getText();
		String[] splitstr = TempWeb.split("°");
		double d = Double.parseDouble(splitstr[0]);
		d = Math.round(d*100.0)/100.0;
		return d;
		 
	}
	
	public double FeelsLike()
	{
		String FtempWeb = feelslike.getText();
		String[] splitstr = FtempWeb.split(" ");
		String[] splitstr2 = splitstr[1].split("°");
		double d = Double.parseDouble(splitstr2[0]);
		d = Math.round(d*100.0)/100.0;;
		return d;
	}
	
	public double getWindSpeed()
	{
		String TempWeb = wind.getText();
		String[] splitstr = TempWeb.split(" ");
		double d = Double.parseDouble(splitstr[1]);
		d = (d*1000)/3600;
		d = Math.round(d*100.0)/100.0;
		return d;
		 
	}
	
	public double getHumidity()
	{
		String TempWeb = humidity.getText();
		String[] splitstr = TempWeb.split("%");
		double d = Double.parseDouble(splitstr[0]);
		return d;
		 
	}
	
	public double getVisibility()
	{
		String TempWeb = visibility.getText();
		String[] splitstr = TempWeb.split(" ");
		double d = Double.parseDouble(splitstr[0]);
		return d*1000;
		 
	}
	
	public double getPressure()
	{
		String TempWeb = pressure.getText();
		String[] splitstr = TempWeb.split(" ");
		double d = Double.parseDouble(splitstr[1]);
		return d;
		 
	}
	
	
	
	
	
	
	
	

}
