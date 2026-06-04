
/**
 * Write a description of class ScoutedRobot here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class ScoutedRobot extends Robot
{
    //instance variables
    private short shrMatchesObserved;
    private byte bytDefenceTime;
    private byte bytMinorPenalties;
    private byte bytMajorPenalties;
    private byte bytDriverRating;
    private byte bytAccuracyRating;
    private String strNotes;
    
    //main constructor
    public ScoutedRobot(short shrTeamNumber, short shrAutoFuelCount, short shrTeleFuelCount, short shrEndFuelCount, byte bytClimbLevel, byte bytDefenceTime, byte bytMinorPenalties, byte bytMajorPenalties, byte bytDriverRating, byte bytAccuracyRating, String strNotes){
        super(shrTeamNumber);
        this.shrMatchesObserved = 1;
        super.setAutoFuelCount(shrAutoFuelCount);
        super.setTeleFuelCount(shrTeleFuelCount);
        super.setEndFuelCount(shrEndFuelCount);
        super.setClimbLevel(bytClimbLevel);
        this.bytDefenceTime = bytDefenceTime;
        this.bytMinorPenalties = bytMinorPenalties;
        this.bytMajorPenalties = bytMajorPenalties;
        this.bytDriverRating = bytDriverRating;
        this.bytAccuracyRating = bytAccuracyRating;
        this.strNotes = strNotes;
    }
    
    //overloaded constructor
    public ScoutedRobot(short shrTeamNumber){
        super(shrTeamNumber);
        this.shrMatchesObserved = 0;
        this.bytDefenceTime = 0;
        this.bytMinorPenalties = 0;
        this.bytMajorPenalties = 0;
        this.bytDriverRating = 0;
        this.bytAccuracyRating = 0;
        this.strNotes = "Unknown";
    }
    
    //methods
    
    //overriden method since the score for scouted robots is calculated differently
    @Override
    public short getIndividualScore(){
        //accuracy factor for shooting fuel (since not all balls will go in and the scouter cant see EVERTHING)
        float fltAccuracyFactor;
        
        //get the accuracy as a percentage
        if (this.bytAccuracyRating > 0){
            fltAccuracyFactor = (float) this.bytAccuracyRating / 5.0f;
        }
        else {
            fltAccuracyFactor = 1.0f;
        }
        
        //calculate the total score
        short shrFuelScore = (short)((super.getAutoFuelCount() + super.getTeleFuelCount() + super.getEndFuelCount()) * fltAccuracyFactor); //multiply the game total score by the accuracy factor to get the most ideal point total
        short shrClimbScore = (short)(super.getClimbLevel() * 10);
        byte bytPenalties = (byte)((this.bytMinorPenalties * 5) + (this.bytMajorPenalties * 15));
        
        return (short)(shrFuelScore + shrClimbScore - bytPenalties);
    }
    
    //toString
    @Override
    public String toString(){
        return String.format("Team %d | Obs: %d | Auto: %d | Tele: %d | End: %d | Climb L%d | " + "Def: %ds | Pen: %d/%d | Drv: %d/5 | Acc: %d/5 | Score: %d", super.getTeamNumber(), this.shrMatchesObserved, super.getAutoFuelCount(), super.getTeleFuelCount(), super.getEndFuelCount(), super.getClimbLevel(), this.bytDefenceTime, this.bytMinorPenalties, this.bytMajorPenalties, this.bytDriverRating, this.bytAccuracyRating, this.getIndividualScore());
    }
    
    //method that updates the average stats of a robot
    public void addMatchObservation(short shrAutoFuelCount, short shrTeleFuelCount, short shrEndFuelCount, int bytClimbLevel, byte bytDefenceTime, byte bytMinorPenalties, byte bytMajorPenalties, byte bytDriverRating, byte bytAccuracyRating){
        //use a temporary previous matches varibale which will be used to calculate verage
        short previousMatchesObserved = this.shrMatchesObserved;
        
        //get the average stats of each fuel count + climb level
        super.setAutoFuelCount((short)((super.getAutoFuelCount() * previousMatchesObserved + shrAutoFuelCount) / (previousMatchesObserved + 1)));
        super.setTeleFuelCount((short)((super.getTeleFuelCount() * previousMatchesObserved + shrTeleFuelCount) / (previousMatchesObserved + 1)));
        super.setEndFuelCount((short)((super.getEndFuelCount() * previousMatchesObserved + shrEndFuelCount) / (previousMatchesObserved + 1)));
        super.setClimbLevel((byte)((super.getClimbLevel() * previousMatchesObserved + bytClimbLevel) / (previousMatchesObserved + 1)));
        
        this.bytDefenceTime = (byte)((this.bytDefenceTime * previousMatchesObserved + bytDefenceTime) / (previousMatchesObserved + 1));
        this.bytMinorPenalties = (byte)((this.bytMinorPenalties * previousMatchesObserved + bytMinorPenalties) / (previousMatchesObserved + 1));
        this.bytMajorPenalties = (byte)((this.bytMajorPenalties * previousMatchesObserved + bytMajorPenalties) / (previousMatchesObserved + 1));
        this.bytDriverRating = (byte)((this.bytDriverRating * previousMatchesObserved + bytDriverRating) / (previousMatchesObserved + 1));
        this.bytAccuracyRating = (byte)((this.bytAccuracyRating * previousMatchesObserved + bytAccuracyRating) / (previousMatchesObserved + 1));
        
        this.shrMatchesObserved++;
    }
    
    //getters and setters
    public short getMatchesObserved(){
        return this.shrMatchesObserved;
    }

    public void setMatchesObserved(short shrMatchesObserved){
        this.shrMatchesObserved = shrMatchesObserved;
    }

    public byte getDefenceTime(){
        return this.bytDefenceTime;
    }

    public byte getMinorPenalties(){
        return this.bytMinorPenalties;
    }

    public byte getMajorPenalties(){
        return this.bytMajorPenalties;
    }

    public byte getDriverRating(){
        return this.bytDriverRating;
    }

    public byte getAccuracyRating(){
        return this.bytAccuracyRating;
    }

    public String getNotes(){
        return this.strNotes;
    }

    public void setDefenceTime(byte bytDefenceTime){
        this.bytDefenceTime = bytDefenceTime;
    }

    public void setMinorPenalties(byte bytMinorPenalties){
        this.bytMinorPenalties = bytMinorPenalties;
    }

    public void setMajorPenalties(byte bytMajorPenalties){
        this.bytMajorPenalties = bytMajorPenalties;
    }

    public void setDriverRating(byte bytDriverRating){
        this.bytDriverRating = bytDriverRating;
    }

    public void setAccuracyRating(byte bytAccuracyRating){
        this.bytAccuracyRating = bytAccuracyRating;
    }

    public void setNotes(String strNotes){
        this.strNotes = strNotes;
    }
}