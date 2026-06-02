
/**
 * Write a description of class TeamRobot here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class TeamRobot extends Robot
{
    //instance variables
    //not particularly useful, but might use in future
    private boolean boolCanPlayDefence;
    
    //constructor
    public TeamRobot(short shrTeamNumber, short shrAutoFuelCount, short shrTeleFuelCount, short shrEndFuelCount, byte bytClimbLevel, boolean boolCanPlayDefence){
        super(shrTeamNumber);
        super.setAutoFuelCount(shrAutoFuelCount);
        super.setTeleFuelCount(shrTeleFuelCount);
        super.setEndFuelCount(shrEndFuelCount);
        super.setClimbLevel(bytClimbLevel);
        this.boolCanPlayDefence = boolCanPlayDefence;
    }
    
    //overriden method for team robot (basically same as super, prolly gonna remove)
    @Override
    public short getIndividualScore(){
        short totalMatchPoints = (short)(super.getAutoFuelCount() + super.getTeleFuelCount() + super.getEndFuelCount() + super.getClimbLevel()*10);
        return totalMatchPoints;
    }
    
    //toString
    @Override
    public String toString(){
        return super.toString() + String.format(" | Defence: %s", this.boolCanPlayDefence); //can format later using yes/no
    }
    
    //gettters and setters
    public boolean getCanPlayDefence(){
        return this.boolCanPlayDefence;
    }
    
    public void setCanPlayDefence(boolean boolCanPlayDefence){
        this.boolCanPlayDefence = boolCanPlayDefence;
    }
}