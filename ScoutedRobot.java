
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
        super(shrTeamNumber);
        this.strNotes = "Unknown";
        
        String[] strParts = csvLine.split(",", 12);
        try {
            super.setTeamNumber(Short.parseShort(strParts[0].trim()));
            super.setAutoFuelCount(Short.parseShort(strParts[1].trim()));
            super.setTeleFuelCount(Short.parseShort(strParts[2].trim()));
            super.setEndFuelCount(Short.parseShort(strParts[3].trim()));
            super.setClimbLevel(Byte.parseByte(strParts[4].trim()));
            this.bytDefenceTime = Byte.parseByte(strParts[5].trim());
            this.bytMinorPenalties = Byte.parseByte(strParts[6].trim());
            this.bytMajorPenalties = Byte.parseByte(strParts[7].trim());
            this.bytDriverRating = Byte.parseByte(strParts[8].trim());
            this.bytAccuracyRating = Byte.parseByte(strParts[9].trim());
            this.shrMatchesObserved = Short.parseShort(strParts[10].trim());
            
            if (strParts.length > 11){
                this.strNotes = strParts[11].trim();
            }
            else {
                this.strNotes = "";
            }
        }
        catch (NumberFormatException e){
            //partial/corrupt csv so leave whatever fields were already set
        }
    }
    
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
    
    //methods
    @Override
    public short getIndividualScore(){
        float fltAccuracyFactor;
        if (this.bytAccuracyRating > 0){
            fltAccuracyFactor = (float) this.bytAccuracyRating / 5.0f;
        }
        else {
            fltAccuracyFactor = 1.0f;
        }
        
        short shrFuelScore = (short)((super.getAutoFuelCount() + super.getTeleFuelCount() + super.getEndFuelCount()) * fltAccuracyFactor);
        short shrClimbScore = (short)(super.getClimbLevel() * 10);
        byte bytPenalties = (byte)((this.bytMinorPenalties * 5) + (this.bytMajorPenalties * 15));
        
        return (short)(shrFuelScore + shrClimbScore - bytPenalties);
    }
    
    @Override
    public String toString(){
        return String.format("Team %d | Obs: %d | Auto: %d | Tele: %d | End: %d | Climb L%d | " + "Def: %ds | Pen: %d/%d | Drv: %d/5 | Acc: %d/5 | Score: %d", super.getTeamNumber(), this.shrMatchesObserved, super.getAutoFuelCount(), super.getTeleFuelCount(), super.getEndFuelCount(), super.getClimbLevel(), this.bytDefenceTime, this.bytMinorPenalties, this.bytMajorPenalties, this.bytDriverRating, this.bytAccuracyRating, this.getIndividualScore());
    }
    
    public void addMatchObservation(short shrAutoFuelCount, short shrTeleFuelCount, short shrEndFuelCount, int bytClimbLevel, byte bytDefenceTime, byte bytMinorPenalties, byte bytMajorPenalties, byte bytDriverRating, byte bytAccuracyRating){
        short previousMatchesObserved = this.shrMatchesObserved;
        
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
    
    public String convertDataToCSV(){
        String strSafeNotes = this.strNotes.replace(",", ";"); //prevent field boundary breaks
        return String.format("%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%s", super.getTeamNumber(), super.getAutoFuelCount(), super.getTeleFuelCount(), super.getEndFuelCount(), super.getClimbLevel(), this.bytDefenceTime, this.bytMinorPenalties, this.bytMajorPenalties, this.bytDriverRating, this.bytAccuracyRating, this.shrMatchesObserved, strSafeNotes);
    }
    
    //getters and setters
    public short getMatchesObserved(){
        return this.shrMatchesObserved;
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