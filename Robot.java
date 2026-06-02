
/**
 * Write a description of class Robot here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class Robot implements java.io.Serializable
{
    //instance variables
    private short shrTeamNumber;
    private short shrAutoFuelCount;
    private short shrTeleFuelCount;
    private short shrEndFuelCount;
    private byte bytClimbLevel;

    //constructor
    public Robot(short shrTeamNumber){
        this.shrTeamNumber = shrTeamNumber;
        this.shrAutoFuelCount = 0;
        this.shrTeleFuelCount = 0;
        this.shrEndFuelCount = 0;
        this.bytClimbLevel = 0;
    }
    
    //calculate the total points a robot gets based on scouting data
    public short getIndividualScore(){
        short totalMatchPoints = (short)(this.shrAutoFuelCount + this.shrTeleFuelCount + this.shrEndFuelCount + this.bytClimbLevel*10);
        return totalMatchPoints;
    }
    
    public String toString(){
        return String.format("Team %d | Auto Points: %d | Teleop Points: %d | Endgame Points: %d | Climb Points: %d | Score: %d", 
        this.shrTeamNumber, this.shrAutoFuelCount, this.shrTeleFuelCount, this.shrEndFuelCount, this.bytClimbLevel, this.getIndividualScore());
    }
    
    //getters and Setters
    
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