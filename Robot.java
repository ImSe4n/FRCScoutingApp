
/**
 * Represents a single robot object
 * Tracks fuel count and climb level (of one match)
 *
 * @author Sean Nie
 * @version 2026-06-08
 */
public class Robot implements java.io.Serializable
{
    //instance variables to track robot statistics
    private short shrTeamNumber;
    private short shrAutoFuelCount;
    private short shrTeleFuelCount;
    private short shrEndFuelCount;
    private byte bytClimbLevel;

    //constructor that initializes a robot entry with its team number
    public Robot(short shrTeamNumber){
        this.shrTeamNumber = shrTeamNumber;
        this.shrAutoFuelCount = 0;
        this.shrTeleFuelCount = 0;
        this.shrEndFuelCount = 0;
        this.bytClimbLevel = 0;
    }
    
    //calculate the total points a robot gets based on scouting data
    public short getIndividualScore(){
        short totalMatchPoints = (short)(this.shrAutoFuelCount + this.shrTeleFuelCount + this.shrEndFuelCount + this.bytClimbLevel*10); //need to multiply climb level by 10 since there are 3 levels and each level increments by 10 points
        return totalMatchPoints;
    }
    
    //toString which returns a formatted summary string of the robot's match performance.
    public String toString(){
        return "Team " + this.shrTeamNumber + " | Auto Points: " + this.shrAutoFuelCount + " | Teleop Points: " + this.shrTeleFuelCount + " | Endgame Points: " + this.shrEndFuelCount + " | Climb Points: " + this.bytClimbLevel + " | Score: " + this.getIndividualScore();
    }
    
    //getters and setters
    
    public short getTeamNumber(){
        return this.shrTeamNumber;
    }
    
    public short getAutoFuelCount(){
        return this.shrAutoFuelCount;
    }
    
    public short getTeleFuelCount(){
        return this.shrTeleFuelCount;
    }
    
    public short getEndFuelCount(){
        return this.shrEndFuelCount;
    }
    
    public byte getClimbLevel(){
        return this.bytClimbLevel;
    }
    
    public void setTeamNumber(short shrTeamNumber){
        this.shrTeamNumber = shrTeamNumber;
    }
    
    public void setAutoFuelCount(short shrAutoFuelCount){
        this.shrAutoFuelCount = shrAutoFuelCount;
    }
    
    public void setTeleFuelCount(short shrTeleFuelCount){
        this.shrTeleFuelCount = shrTeleFuelCount;
    }
    
    public void setEndFuelCount(short shrEndFuelCount){
        this.shrEndFuelCount = shrEndFuelCount;
    }
    
    public void setClimbLevel(byte bytClimbLevel){
        this.bytClimbLevel = bytClimbLevel;
    }
}