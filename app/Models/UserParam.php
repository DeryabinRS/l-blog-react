<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserParam extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_name',
        'avatar',
        'age',
        'gender',
        'phone'
    ];

    /**
     * Relationship with User model
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor for avatar URL
     */
    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset('storage/avatars/' . $this->avatar) : null;
    }

    /**
     * Accessor for full name
     */
    public function getFullNameAttribute()
    {
        return trim("{$this->last_name} {$this->first_name} {$this->middle_name}");
    }
}
