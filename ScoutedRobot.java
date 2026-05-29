
/**
 * Write a description of class ScoutedRobot here.
 *
 * @author (your name)
 * @version (a version number or a date)
 */
public class ScoutedRobot extends Robot
{
    private short shrMatchesObserved;
    private byte bytDefenceTime;
    private byte bytMinorPenalties;
    private byte bytMajorPenalties;
    private byte bytDriverRating;
    private byte bytAccuracyRating;
    private String strNotes;
    
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
    
    public ScoutedRobot(short shrTeamNumber, String csvLine){
        //
    }
    
    public ScoutedRobot(short shrTeamNumber, short shrAutoFuelCount, short shrTeleFuelCount, short shrEndFuelCount, byte bytClimbLevel, byte bytDefenceTime, byte bytMinorPenalties, byte bytMajorPenalties, byte bytDriverRating, byte bytAccuracyRating, String strNotes){
        super(shrTeamNumber);
        this.shrMatchesObserved = 1;
        super.setAutoFuelCount(shrAutoFuelCount);
        super.setTeleFuelCount(shrTeleFuelCount);
        super.setEndFuelCount(shrEndFuelCount);
        this.bytDefenceTime = bytDefenceTime;
        this.bytMinorPenalties = bytMinorPenalties;
        this.bytMajorPenalties = bytMajorPenalties;
        this.bytDriverRating = bytDriverRating;
        this.bytAccuracyRating = bytAccuracyRating;
        this.strNotes = strNotes;
    }
    
    //methods
    
    
    //getters and setters

}